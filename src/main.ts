import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, type NestApplicationOptions } from '@nestjs/common';
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const configNest: NestApplicationOptions = {
    cors: true
  }
  
  const app = await NestFactory.create(AppModule, configNest);

  app.use(bodyParser.json({ limit: '150mb'}))

  await app.listen(process.env.PORT || 3000, () => {
    Logger.log(`Server listen on port: ${process.env.PORT || 3000}`, 'InitServer')
  });
}
bootstrap();
