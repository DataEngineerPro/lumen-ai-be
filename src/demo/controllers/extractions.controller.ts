import { DemoRepository } from 'src/dynamodb/repositories/demo.repository';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Extractions } from '../models/model';
import { ExtractionService } from '../services/extraction.service';

@Controller('extractions')
export class ExtractionsController {
  readonly logger = new Logger(Extractions.name);
  constructor(
    private readonly repository: DemoRepository,
    private readonly extractionService: ExtractionService,
  ) {}

  @Get(':id')
  async get(@Param('id') id: string): Promise<any> {
    const item = await this.repository.getById(id);
    this.logger.log(item);
    if (item) {
      this.logger.log(item.extractions);
      return item.extractions;
    }

    throw new NotFoundException('Invalid!');
  }

  @Post(':id')
  async create(
    @Param('id') id: string,
    @Body() body: Extractions,
  ): Promise<any> {
    return this.extractionService.performExtraction(body).then((data) => {
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
    return this.repository.updateExtractions(body, id, key);
  }

  @Delete(':id/:key')
  async delete(
    @Param('id') id: string,
    @Param('key') key: string,
  ): Promise<any> {
    return this.repository.removeExtraction(id, key);
  }
}
