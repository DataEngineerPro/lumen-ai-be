import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommand,
  UpdateCommand,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { randomUUID } from 'crypto';
import { Logger, Injectable } from '@nestjs/common';

type ArrayElement<T> = T extends Array<infer R> ? R : never;

type QueryInput<TModel, TModelKey = keyof TModel> = Omit<
  QueryCommandInput,
  'TableName' | 'ProjectionExpression' | 'ExpressionAttributeNames'
> & {
  ProjectionExpression?: Array<TModelKey>;
  ExpressionAttributeNames?: Partial<
    Record<`#${TModelKey & string}`, TModelKey & string>
  >;
};

type QueryOutput<TModel, TParams> = TParams extends {
  ProjectionExpression: infer TProjection;
}
  ? TProjection extends Array<keyof TModel>
    ? Array<Pick<TModel, Extract<ArrayElement<TProjection>, keyof TModel>>>
    : never
  : TModel[];

@Injectable()
export abstract class BaseRepository<T> {
  readonly logger = new Logger(BaseRepository.name);
  protected abstract tableName: string;

  constructor(private readonly docClient: DynamoDBDocumentClient) {}

  async get(key: Partial<T>): Promise<T | null> {
    const { Item } = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: key,
      }),
    );

    return Item ? (Item as T) : null;
  }

  async query<TParams extends QueryInput<T>>(
    params: TParams,
  ): Promise<QueryOutput<T, TParams>> {
    const result: any[] = [];

    const outputs = await this.queryAll(params);
    outputs.forEach(({ Items }) => {
      if (Items) {
        result.push(...Items);
      }
    });

    return result as QueryOutput<T, TParams>;
  }

  async count(params: QueryInput<T>): Promise<number> {
    const outputs = await this.queryAll({ ...params, Select: 'COUNT' });
    return outputs.reduce((acc, { Count }) => acc + (Count ?? 0), 0);
  }

  protected async queryAll(
    params: QueryInput<T>,
  ): Promise<QueryCommandOutput[]> {
    const queryParams: QueryCommandInput = {
      ...params,
      TableName: this.tableName,
      ExpressionAttributeNames: params.ExpressionAttributeNames as Record<
        string,
        string
      >,
      ProjectionExpression: undefined,
    };

    if (params.ProjectionExpression) {
      queryParams.ProjectionExpression = params.ProjectionExpression.map(
        (p) => `#${String(p)}`,
      ).join(',');
      queryParams.ExpressionAttributeNames = {
        ...params.ProjectionExpression.reduce(
          (acc, p) => {
            acc[`#${String(p)}`] = String(p);
            return acc;
          },
          {} as Record<string, string>,
        ),
        ...(queryParams.ExpressionAttributeNames ?? {}),
      };
    }
    this.logger.log(JSON.stringify(queryParams));
    const result: QueryCommandOutput[] = [];

    do {
      const output = await this.docClient.send(new QueryCommand(queryParams));
      result.push(output);
      queryParams.ExclusiveStartKey = output.LastEvaluatedKey;
    } while (queryParams.ExclusiveStartKey);

    return result;
  }

  async getAllDocuments() {
    const params = {
      TableName: this.tableName,
    };
    const results = await this.docClient.send(new ScanCommand(params));
    this.logger.log(results.Items);
    return results.Items as any[];
  }

  async create(contact: any) {
    const id = randomUUID().toString();
    return this.docClient
      .send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: {
            id: { S: id },
            customer: { M: marshall(contact) },
            documents: {
              M: {},
            },
            labels: {
              M: {},
            },
            extractions: {
              M: {},
            },
          },
        }),
      )
      .then((data) => {
        this.logger.log(data);
        return id;
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }

  async updateItem(item: any, type: string, key?: string) {
    if (!key) key = randomUUID().toString();
    const pk = 'id';
    const itemKeys = Object.keys(item).filter((k) => k !== pk);
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      UpdateExpression: `SET ${itemKeys
        .map((k, index) => `#type.#field${index} = :value${index}`)
        .join(', ')}`,
      ExpressionAttributeNames: itemKeys.reduce(
        (accumulator, k, index) => ({
          ...accumulator,
          [`#field${index}`]: k,
        }),
        { [`#type`]: type },
      ),
      ExpressionAttributeValues: itemKeys.reduce(
        (accumulator, k, index) => ({
          ...accumulator,
          [`:value${index}`]: item[k],
        }),
        {},
      ),
      Key: {
        [pk]: key,
      },
      ReturnValues: 'ALL_NEW',
    };
    this.logger.log(JSON.stringify(params));
    return await this.docClient.send(new UpdateCommand(params));
  }

  async updateMap(item: any, type: string, id: string, key?: string) {
    if (!key) key = randomUUID().toString();
    const pk = 'id';
    const itemKeys = Object.keys(item).filter((k) => k !== pk);
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      UpdateExpression: `SET #type.#key = :value`,
      ExpressionAttributeValues: {
        ':value': { ...item },
      },
      ExpressionAttributeNames: {
        '#type': type,
        '#key': key,
      },
      Key: {
        [pk]: id,
      },
      ReturnValues: 'ALL_NEW',
    };
    this.logger.log(JSON.stringify(params));
    return await this.docClient.send(new UpdateCommand(params));
  }
}
