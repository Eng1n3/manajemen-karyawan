import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import dataSource from './database/data-source';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  await dataSource.initialize();
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  const port = +configService.get<number>('PORT');
  await app.listen(port);
}
bootstrap();
