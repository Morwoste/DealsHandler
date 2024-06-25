import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AccountInstallDTO {
  @ApiProperty({
    example: 'def502009b3d2ab2cc759db4c1a98061767e0',
    description: 'Код авторизации',
  })
  @IsNotEmpty({message: 'code must be provided'})
  public readonly code: string;

  @ApiProperty({
    example: 'example.amocrm.ru',
    description: 'Адрес аккаунта пользователя',
  })
  @IsNotEmpty({message: 'referer must be provided'})
  public readonly referer: string;

  @ApiProperty({
    example: '8db75afd-e11d-4315-9131-882c75ff8d15',
    description: 'ID интеграции',
  })
  @IsNotEmpty({message: 'client_id must be provided'})
  public readonly client_id: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty({message: 'platform must be provided'})
  public readonly platform: string;

  @ApiProperty({
    example: '1',
    description: 'Указывает что запрос был вызван установкой виджета',
  })
  @IsOptional()
  public readonly from_widget: string;
}
