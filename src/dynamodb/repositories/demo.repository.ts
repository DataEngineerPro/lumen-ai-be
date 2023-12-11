import { DynamoDBRepository } from '../dynamodb.decorator';
import { BaseRepository } from './base.repository';

export interface Demo {
  id: string;
}

@DynamoDBRepository()
export class DemoRepository extends BaseRepository<Demo> {
  protected tableName = 'demo';

  getById(id: string): Promise<Demo | null> {
    return this.get({ id });
  }

  getAll(): Promise<Demo[]> {
    return this.getAllDocuments()
  }
}