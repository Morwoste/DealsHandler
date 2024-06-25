import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerService } from 'src/core/logger/logger.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { AmoApiModule } from 'src/modules/amo-api/amo-api.module';
import { AccountModule } from 'src/modules/account/account.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.env.NODE_ENV.toLowerCase()}.env`,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DB_CONNECT: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('DB_CONNECT'),
        dbName: configService.get('DB_NAME'),
      }),
      inject: [ConfigService],
    }),
    AmoApiModule,
    AccountModule,
  ],

  controllers: [AppController],
  providers: [LoggerService],
})
export class AppModule {}
