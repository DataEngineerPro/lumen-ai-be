import { DemoRepository } from 'src/dynamodb/repositories/demo.repository';
import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileS3Serivce } from '../services/files3.service';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ExtractionService } from '../services/extraction.service';
import { diskStorage } from 'multer';
import * as fs from 'fs';

@Controller('documents')
export class DocumentsController {
  readonly logger = new Logger(DocumentsController.name);
  constructor(
    private readonly repository: DemoRepository,
    private readonly fileService: FileS3Serivce,
    private readonly extractionService: ExtractionService,
  ) { }



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



  @UseInterceptors(FilesInterceptor('files', 100, {
    storage: diskStorage({
      destination: (req:any, file, cb) => {
        const id = req.params.id;
        const path = `./raw/${id}`
        fs.mkdirSync(path, { recursive: true })
        return cb(null, path)
      },
      filename: (req: any, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
        const { originalname } = file;
        const sanitizedName = originalname
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase();
        callback(null, `${sanitizedName}`);
      }
    }),
    fileFilter: (req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
      const { mimetype, size } = file;
      if (size > 3 * 1024 * 1024) {
        callback(null, false);
      }
      else if (
        mimetype !== 'application/pdf' &&
        mimetype !== 'image/jpeg' &&
        mimetype !== 'image/png'
      ) {
        callback(null, false);
      }
      else
        callback(null, true);
    }
  }))
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('id') id: string,
  ): Promise<any> {
    files.forEach(file => {

      console.log(file);
    });
    

    // TODO : Process Files and Add to MongoDB

    return id;
  }


}
