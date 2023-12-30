import { Module } from '@nestjs/common';
import { CustomerController } from './controllers/customer.controller';
import { LabelsController } from './controllers/label.controller';
import { ExtractionsController } from './controllers/extractions.controller';
import { FileS3Serivce } from './services/files3.service';

@Module({
    controllers: [CustomerController, LabelsController,ExtractionsController],
    providers: [FileS3Serivce],
})
export class DemoModule {}
