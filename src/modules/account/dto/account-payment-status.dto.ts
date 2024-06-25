import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaymentStatusDTO {
  @ApiProperty({ example: '64587554', description: 'ID пользователя amoCRM' })
  @Type(() => Number)
  public accountId: number;
}
