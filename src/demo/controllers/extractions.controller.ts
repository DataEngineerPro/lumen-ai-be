import { DemoRepository } from 'src/dynamodb/repositories/demo.repository';
import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Extractions } from '../models/model';
import { HttpService } from '@nestjs/axios';

@Controller('extractions')
export class ExtractionsController {
  readonly logger = new Logger(Extractions.name);
  constructor(
    private readonly repository: DemoRepository,
    private readonly httpService: HttpService,
  ) {}

  @Get(':id')
  async get(@Param('id') id: string): Promise<any> {
    const item = await this.repository.getById(id);

    if (item) {
      this.logger.log(item.extractions);
      return item.labels;
    }

    throw new NotFoundException('Invalid!');
  }

  @Post(':id')
  async create(
    @Param('id') id: string,
    @Body() body: Extractions,
  ): Promise<any> {
    const s3Uri = this.convertToS3Uri(body.document);
    return this.httpService.axiosRef
      .get(
        `https://lumenai.eucloid.com/api/ocr?url=${s3Uri}&left=${Math.floor(
          body.left,
        )}&top=${Math.floor(body.top)}&width=${Math.floor(
          body.width,
        )}&height=${Math.floor(body.height)}`,
      )
      .then((response) => response.data)
      .then((data) => {
        this.logger.log(data);
        body.extractedText = data;
        return this.repository.createExtractions(body, id);
      });
  }

  @Put(':id/:key')
  async update(
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() body: Extractions,
  ): Promise<any> {
    this.logger.log(`PUT ${id}-${key}-${body}`);
    return this.repository.updateExtractions(body, id, key);
  }

  convertToS3Uri(url: string) {
    const regex = /https?:\/\/(.+?)\.s3\.amazonaws\.com\/(.+)/;
    const replacement = 's3://$1/$2';
    return url.replace(regex, replacement);
  }
}
