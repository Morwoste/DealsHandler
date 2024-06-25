import { MongooseModule } from '@nestjs/mongoose';
import { AmoApiModule } from '../amo-api/amo-api.module';
import { Account, AccountSchema } from './account.model';
import { Module, forwardRef } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { LoggerService } from 'src/core/logger/logger.service';
import { AccountController } from './account.controller';

@Module({
  imports: [
    forwardRef(() => AmoApiModule),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  providers: [AccountService, AccountRepository, LoggerService],
  controllers: [AccountController],
  exports: [AccountService, AccountRepository],
})
export class AccountModule {}
