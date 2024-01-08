import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  DemoRepository,
  Demo,
} from '../../dynamodb/repositories/demo.repository';

import { Contact } from '../models/model';
import { EmailService } from '../services/email.service';

@Controller('customer')
export class CustomerController {
  constructor(
    private readonly repository: DemoRepository,
    private emailService: EmailService,
  ) {}

  @Get(':id')
  async get(@Param('id') id: string): Promise<Demo> {
    const item = await this.repository.getById(id);

    if (item) {
      return item;
    }

    throw new NotFoundException('Invalid!');
  }

  @Get()
  async getAll(): Promise<Demo[]> {
    const item = await this.repository.getAll();

    if (item) {
      return item;
    }

    throw new NotFoundException('Invalid!');
  }

  @Post()
  async createContact(@Body() contact: Contact): Promise<any> {
    const id = await this.repository.createContact(contact);
    const data = await this.repository.getById(id.session_id);
    await this.emailService.sendEmail('Accquisition', data);
    return id;
  }

  @Put(':id')
  async updateContact(
    @Param('id') id: string,
    @Body() contact: Contact,
  ): Promise<any> {
    const resp = await this.repository.updateContact(contact, id);
    const data = resp.Attributes;
    const newData = {
      ...data,
      extractionsArray: Object.keys(data.extractions).map((e) => {
        return {
          ...data.extractions[e],
          userText: data.extractions[e].userText || '',
          comments: data.extractions[e].comments || '',
          labelText: data.labels[data.extractions[e].label].text,
        };
      }),
    };
    await this.emailService.sendEmail('Feedback', newData);
    return data;
  }
}
