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
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileS3Serivce } from '../services/files3.service';

@Controller('label')
export class DocumentsController {
    readonly logger = new Logger(DocumentsController.name);
    constructor(private readonly repository: DemoRepository, private readonly fileService:FileS3Serivce) { }

    @Get(':id')
    async get(
        @Param('id') id: string,
    ): Promise<any> {
        const item = await this.repository.getById(id);

        if (item) {
            this.logger.log(item.documents)
            return item.documents;
        }

        throw new NotFoundException('Invalid!');
    }

    @Get(':id/:page')
    async getPage(
        @Param('id') id: string,
        @Param('page') page: string,
    ): Promise<any> {
        const item = await this.repository.getById(id);

        if (item) {
            this.logger.log(item.documents)
            return item.documents[page];
        }

        throw new NotFoundException('Invalid!');
    }

    @Post(':id')
    @UseInterceptors(FileInterceptor('file'))
    async create(@Param('id') id:string, @UploadedFile() file: Express.Multer.File): Promise<any>{
        const {originalname, mimetype, buffer} = file;
        const s3Response = await this.fileService.s3_upload(buffer, 'demo-bucket', originalname, mimetype,id);
        if(s3Response)
        return s3Response.Location;

        return null;
    }

}
