import { Module } from '@nestjs/common';
import { CustomerController } from './controllers/customer.controller';
import { LabelsController } from './controllers/label.controller';
import { ExtractionsController } from './controllers/extractions.controller';
import { FileS3Serivce } from './services/files3.service';
import { DocumentsController } from './controllers/documents.controller';
import { HttpModule } from '@nestjs/axios';
import { ExtractionService } from './services/extraction.service';
import { EmailService } from './services/email.service';

@Module({
  imports: [HttpModule],
  controllers: [
    CustomerController,
    LabelsController,
    ExtractionsController,
    DocumentsController,
  ],
  providers: [FileS3Serivce, ExtractionService, EmailService],
})
export class DemoModule { }
