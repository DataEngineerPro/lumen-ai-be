import { DemoRepository } from 'src/dynamodb/repositories/demo.repository';
import {
  BadRequestException,
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
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Document } from '../models/model';
import { ExtractionService } from '../services/extraction.service';

@Controller('documents')
export class DocumentsController {
  readonly logger = new Logger(DocumentsController.name);
  constructor(
    private readonly repository: DemoRepository,
    private readonly fileService: FileS3Serivce,
    private readonly extractionService: ExtractionService,
  ) {}

  @Get(':id')
  async get(@Param('id') id: string): Promise<any> {
    const item = await this.repository.getById(id);

    if (item) {
      this.logger.log(item.documents);
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
      this.logger.log(item.documents);
      let returnValue = item.documents[page];
      return this.fileService.getDisplayUrl(returnValue.displayUrl);
    }

    throw new NotFoundException('Invalid!');
  }

  @Post(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile('file') file: Express.Multer.File,
    @Param('id') id: string,
  ): Promise<any> {
    const { originalname, mimetype, buffer } = file;
    const sanitizedName = originalname
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    if (file.size > 3 * 1024 * 1024) {
      return new BadRequestException("File size can't be more than 3MB");
    }
    if (
      file.mimetype !== 'application/pdf' &&
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'image/png'
    ) {
      return new BadRequestException('File type can only be pdf, jpeg or png');
    }
    const s3Response = await this.fileService.uploadFile(file, id);
    if (s3Response) {
      let s3Uri = `s3://${this.fileService.Bucket}/${id}/${sanitizedName}`;
      this.logger.log(s3Uri);
      let documentsData: { [k: string]: any } = {};
      documentsData['master'] = {
        url: s3Uri,
        page: 'master',
      };
      if (file.mimetype === 'application/pdf') {
        return this.extractionService.processPDF(s3Uri).then(async (data) => {
          this.logger.log(data);
          const pagesToProcess = data.length > 25 ? 25 : data.length;
          for (let i = 0; i < pagesToProcess; i++) {
            documentsData[data[i].page] = data[i];
          }
          this.logger.log(documentsData);
          return this.repository.bulkLoadDocuments(documentsData, id);
        });
      }
      return this.extractionService.processImage(s3Uri).then((data) => {
        this.logger.log(data);
        documentsData[data.page] = data;
        return this.repository.bulkLoadDocuments(documentsData, id);
      });
    }

    return null;
  }
}
