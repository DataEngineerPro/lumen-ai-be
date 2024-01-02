import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Extractions } from '../models/model';

export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
  private readonly API_ENDPOINT: string =
    this.config.get<string>('API_ENDPOINT') || '';
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async processImage(url: string) {
    return this.httpService.axiosRef
      .get(
        `${this.API_ENDPOINT}/api/processimage?url=${encodeURIComponent(url)}`,
      )
      .then((response) => response.data);
  }

  async processPDF(url: string) {
    return this.httpService.axiosRef
      .get(`${this.API_ENDPOINT}/api/processpdf?url=${encodeURIComponent(url)}`)
      .then((response) => response.data);
  }

  async performExtraction(extraction: Extractions) {
    const s3Uri = this.convertToS3Uri(extraction.document);
    return this.httpService.axiosRef
      .get(
        `${this.API_ENDPOINT}/api/ocr?url=${s3Uri}&left=${Math.floor(
          extraction.left,
        )}&top=${Math.floor(extraction.top)}&width=${Math.floor(
          extraction.width,
        )}&height=${Math.floor(extraction.height)}`,
      )
      .then((response) => response.data);
  }
  convertToS3Uri(url: string) {
    const regex = /https?:\/\/(.+?)\.s3\.amazonaws\.com\/(.+)/;
    const replacement = 's3://$1/$2';
    return url.replace(regex, replacement);
  }
}
