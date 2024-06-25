import { Module, forwardRef } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { AmoApiService } from './amo-api.service';
import { LoggerService } from 'src/core/logger/logger.service';

@Module({
  providers: [AmoApiService, LoggerService],
  exports: [AmoApiService],
})
export class AmoApiModule {}
