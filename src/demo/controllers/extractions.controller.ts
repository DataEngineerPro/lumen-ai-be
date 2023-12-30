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
import { Extractions, Record } from '../models/model';

@Controller('extractions')
export class ExtractionsController {
    readonly logger = new Logger(Extractions.name);
    constructor(private readonly repository: DemoRepository) { }

    @Get(':id')
    async get(
        @Param('id') id: string,
    ): Promise<any> {
        const item = await this.repository.getById(id);

        if (item) {
            this.logger.log(item.extractions)
            return item.labels;
        }

        throw new NotFoundException('Invalid!');
    }

    @Post(':id')
    async create(@Param('id') id:string, @Body() body:Partial<Extractions>): Promise<any>{
        return this.repository.updateExtractions(body,id)
    }

    @Put(':id/:key')
    async update(@Param('id') id:string, @Param('key') key:string, @Body() body:Partial<Extractions>): Promise<any>{
        this.logger.log(`PUT ${id}-${key}-${body}`)
        return this.repository.updateExtractions(body,id,key)
    }
}
