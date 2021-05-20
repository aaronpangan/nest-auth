import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as config from 'config';
async function start() {
  const port = config.get('server').port || process.env.PORT;
  const logger = new Logger('start');
  const app = await NestFactory.create(AppModule, {
    logger: true,
  });

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  }

  await app.use(cookieParser());
  await app.listen(port);

  logger.log(`Application listening on port ${port}`);
}
start();
