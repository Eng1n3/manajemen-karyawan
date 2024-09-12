import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import dataSource from './database/data-source';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  await dataSource.initialize();
  const configService = app.get(ConfigService);
  const port = +configService.get<number>('PORT');
  await app.listen(3000);
}
bootstrap();
