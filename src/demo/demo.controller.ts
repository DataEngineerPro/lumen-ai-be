import {
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import {
    DemoRepository,
    Demo,
} from '../dynamodb/repositories/demo.repository';

@Controller('demo')
export class DemoController {
    constructor(private readonly repository: DemoRepository) { }

    @Get('/:id')
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
    async getAll(
       
    ): Promise<Demo[]> {
        const item = await this.repository.getAll();

        if (item) {
            return item;
        }

        throw new NotFoundException('Invalid!');
    }
}