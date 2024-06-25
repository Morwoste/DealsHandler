import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { LoggerService } from './core/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { ApplicationConfigSchema } from './core/config/app.schema';

async function bootstrap() {
  const logger = new LoggerService();
  const config = new ConfigService<ApplicationConfigSchema>();
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });
  logger.info(`SERVER IS WORKING ON PORT: ${config.get('PORT')} `);
  await app.listen(config.get('PORT'));
}
bootstrap();
