import { NestFactory } from '@nestjs/core';
import { QueueModule } from './queue.module';

async function bootstrap() {
  const app = await NestFactory.create(QueueModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
