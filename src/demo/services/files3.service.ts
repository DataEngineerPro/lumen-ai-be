// file: aws-s3 > src > app.service.ts
import { Injectable, Logger, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {S3Client} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const Bucket = process.env.S3_BUCKET || "";

@Injectable()
export class FileS3Serivce {
    readonly logger = new Logger(FileS3Serivce.name);
    constructor(private config:ConfigService) { }

  s3 = new S3Client({
    credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY')||"",
        secretAccessKey: this.config.get<string>('AWS_SECRET_KEY')||"",
    },
    region: this.config.get<string>('S3_REGION'),
  });

  async uploadFile(file: Express.Multer.File,id:string) {
    this.logger.log(file);
    const { originalname } = file;

    return await this.s3_upload(
      file.buffer,
      Bucket,
      originalname,
      file.mimetype,
      id
    );
  }

  async s3_upload(file: Buffer, bucket:string, name:string, mimetype:string,id:string) {
    const params = {
      Bucket: bucket,
      Key: String(id+'/'+name),
      Body: file,
      ContentType: mimetype,
    };

    try {
        
      let s3Response = new Upload({client: this.s3, params: params});
      return s3Response.done();
    } catch (e) {
      this.logger.error(e);
    }
  }
}