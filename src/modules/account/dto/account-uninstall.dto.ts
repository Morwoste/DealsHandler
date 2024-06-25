import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AccountUninstallDTO {
  @ApiProperty({ example: '35870912', description: 'ID аккаунта amoCRM' })
  @IsNumber()
  @Type(() => Number)
  public readonly account_id: number;

  @ApiProperty({ description: 'Уникальный UUID виджета' })
  @IsNotEmpty({message: 'client_uuid must be provided'})
  readonly client_uuid: string;
}
