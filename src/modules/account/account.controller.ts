import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { Endpoints } from 'src/core/consts/endpoints';
import { AccountInstallDTO } from './dto/account-install.dto';
import { AccountUninstallDTO } from './dto/account-uninstall.dto';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { PaymentStatusDTO } from './dto/account-payment-status.dto';
import { LoggerService } from 'src/core/logger/logger.service';
import { AccountDocument } from './account.model';

@ApiTags('Базовая работа с виджетом')
@Controller(Endpoints.User.Main)
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly logger: LoggerService
  ) {}

  @ApiOperation({ summary: 'Установка виджета' })
  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @Get(Endpoints.User.Routs.Install)
  public async installWidget(
    @Query() widgetUserInfo: AccountInstallDTO,
  ): Promise<AccountDocument> {
    this.logger.info(`Recieved install request from: ${widgetUserInfo.referer}`)
    return await this.accountService.install(widgetUserInfo);
  }

  @ApiOperation({ summary: 'Удаления виджета' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @Get(Endpoints.User.Routs.UnInstall)
  public async unInstallWidget(
    @Query() { account_id, client_uuid }: AccountUninstallDTO,
  ): Promise<void> {
    this.logger.info(`Recieved uninstall request for account: ${account_id}`)
    await this.accountService.unInstall(account_id, client_uuid);
  }

  @ApiOperation({ summary: 'Получение статуса оплаты пользователя' })
  @ApiResponse({ status: HttpStatus.OK })
  @Get(Endpoints.User.Routs.Status)
  public async paidStatus(
    @Query() { accountId }: PaymentStatusDTO,
  ): Promise<boolean> {
    return await this.accountService.getPaymentStatus(accountId);
  }
}
