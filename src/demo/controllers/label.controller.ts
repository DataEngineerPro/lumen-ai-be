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
import { Label, Record } from '../models/model';

@Controller('label')
export class LabelsController {
  readonly logger = new Logger(LabelsController.name);
  constructor(private readonly repository: DemoRepository) {}

  @Get(':id')
  async get(@Param('id') id: string): Promise<any> {
    const item = await this.repository.getById(id);

    if (item) {
      this.logger.log(item.labels);
      return item.labels;
    }

    throw new NotFoundException('Invalid!');
  }

  @Post(':id')
  async createLabel(
    @Param('id') id: string,
    @Body() body: Label,
  ): Promise<any> {
    return this.repository.createLabels(body, id);
  }

  @Put(':id/:key')
  async updateContact(
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() body: Label,
  ): Promise<any> {
    this.logger.log(`PUT ${id}-${key}-${body}`);
    return this.repository.updateLabels(body, id, key);
  }
}
