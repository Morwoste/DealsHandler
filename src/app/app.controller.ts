import { Controller, Get } from '@nestjs/common';
import { LoggerService } from 'src/core/logger/logger.service';

@Controller()
export class AppController {
  constructor(private readonly logger: LoggerService) {}

  @Get()
  public ping(): string {
    const  resMessage = 'SERVER IS ALIVE'
    this.logger.info(resMessage);
    return resMessage;
  }
}
