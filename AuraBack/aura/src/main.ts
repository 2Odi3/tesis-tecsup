import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const puerto = 3000;
  await app.listen(puerto);
  console.log(`Api iniciada en el puerto ${puerto}!`)
}
bootstrap();
