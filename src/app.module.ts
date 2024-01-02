import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DynamodbModule } from './dynamodb/dynamodb.module';
import { DemoModule } from './demo/demo.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
    }),
    DynamodbModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        region: config.get<string>('REGION'),
        endpoint: config.get<string>('DYNAMODB_ENDPOINT'),
        credentials: {
          accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID', ''),
          secretAccessKey: config.get<string>('AWS_SECRET_KEY', ''),
        },
      }),
    }),
    DemoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
