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

import {Contact} from '../models/model'

@Controller('customer')
export class CustomerController {
    constructor(private readonly repository: DemoRepository) { }

    @Get(':id')
    async get(
        @Param('id') id: string,
    ): Promise<Demo> {
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
    async createContact(@Body() contact:Contact): Promise<any>{
        return this.repository.createContact(contact)
    }

    @Put(':id')
    async updateContact(@Param('id') id:string, @Body() contact:Contact): Promise<any>{
        return this.repository.updateContact(contact,id)
    }
}