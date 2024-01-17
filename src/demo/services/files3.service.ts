// file: aws-s3 > src > app.service.ts
import { Injectable, Logger, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { HttpRequest } from '@smithy/protocol-http';
import { Hash } from '@smithy/hash-node';
import { parseUrl } from '@smithy/url-parser';
import { formatUrl } from '@aws-sdk/util-format-url';
@Injectable()
export class FileS3Serivce {
  readonly logger = new Logger(FileS3Serivce.name);
  readonly s3: S3Client;
  readonly Bucket: string;
  readonly preSigner: S3RequestPresigner;
  constructor(private config: ConfigService) {
    this.logger.log('Region : ' + this.config.get<string>('REGION'));
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.config.get<string>('AWS_SECRET_KEY') || '',
      },
      region: this.config.get<string>('REGION'),
    });
    this.Bucket = this.config.get<string>('S3_BUCKET') || '';
    this.preSigner = new S3RequestPresigner({
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.config.get<string>('AWS_SECRET_KEY') || '',
      },
      region: this.config.get<string>('REGION') || '',
      sha256: Hash.bind(null, 'sha256'),
    });
  }

  async uploadFile(file: Express.Multer.File, id: string) {
    const { originalname } = file;
    const sanitizedName = originalname
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    return await this.s3_upload(
      file.buffer,
      this.Bucket,
      sanitizedName,
      file.mimetype,
      id,
    );
  }

  async getDisplayUrl(url: string) {
    try {
      const parsedUrl = parseUrl(url);

      const signedUrlObject = await this.preSigner.presign(
        new HttpRequest(parsedUrl),
      );
      return formatUrl(signedUrlObject);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async s3_upload(
    file: Buffer,
    bucket: string,
    name: string,
    mimetype: string,
    id: string,
  ) {
    const params = {
      Bucket: bucket,
      Key: String(id + '/' + name),
      Body: file,
      ContentType: mimetype,
    };

    try {
      let s3Response = new Upload({ client: this.s3, params: params });
      return s3Response.done();
    } catch (e) {
      this.logger.error(e);
    }
  }
}
