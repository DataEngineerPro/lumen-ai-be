import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { process } from 'process'; // Import the process module

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Lumen AI API')
    .setDescription('API test page for Lumen AI')
    .setVersion('1.0')
    .addTag('demo')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 3000); // Use process.env.PORT to access the PORT environment variable
}
bootstrap();
