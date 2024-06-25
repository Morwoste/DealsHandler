import { AccountRepository } from './account.repository';
import { LoggerService } from 'src/core/logger/logger.service';
import { jwtDecode } from 'jwt-decode';
import { HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Account, AccountDocument } from './account.model';
import * as dayjs from 'dayjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AmoApiService } from '../amo-api/amo-api.service';
import { ErrorHandler } from 'src/core/decorators/ErrorHandler.decorator';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class AccountService {
  constructor(
    @Inject(forwardRef(() => AmoApiService))
    private readonly amoApiService: AmoApiService,
    private readonly accountRepository: AccountRepository,
    private readonly logger: LoggerService,
  ) {}

  @ErrorHandler()
  public async install({
    referer,
    code,
  }: {
    referer: string;
    code: string;
  }): Promise<AccountDocument> {
    const accountSubdomain: string = referer?.split('.')[0] || '';
    if (!accountSubdomain || code) {
      this.logger.error('No subdomain or code was passed!');
      throw new BadRequestException('No subdomain or code was passed!');
    }
    this.logger.log(`Attempt to get tokens for ${accountSubdomain}`);
    const tokenData = await this.amoApiService.requestAccessToken(
      accountSubdomain,
      code,
    );
    if (!tokenData) {
      this.logger.error(`Failed with recieving tokens for${accountSubdomain}`);
      throw new UnauthorizedException(
        `Failed with recieving tokens for${accountSubdomain}`,
      );
    }
    this.logger.log(`Tokens for ${accountSubdomain} recived`);
    const { account_id:number } = jwtDecode(tokenData.access_token);
    if (!account_id) {
      this.logger.error(`Failed with recieving tokens for${accountSubdomain}`);
      throw new NotFoundException(
        `Failed with recieving tokens for${accountSubdomain}`,
      );
    }
    const foundAccount =
      await this.accountRepository.getAccountById(account_id);
    if (!foundAccount) {
      const newAccount: Account = {
        accountId: account_id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        subdomain: accountSubdomain,
      };
      const installedAccount =
        await this.accountRepository.createAccount(newAccount);
      this.logger.info(
        'Widget has been installed and account added to DataBase!',
      );
      return installedAccount;
    }
    this.logger.log(`Found Account: ${foundAccount}`);
    foundAccount.installed = true;
    const installedAccount =
      await this.accountRepository.updateAccountByID(foundAccount);
    this.logger.info(
      'Widget has been installed and account updated in DataBase!',
    );
    return installedAccount;
  }

  @ErrorHandler()
  public async unInstall(
    accountId: number,
    client_uuid: string,
  ): Promise<AccountDocument> {
    if (!accountId) {
      this.logger.error(`Failed to uninstall widget. AccountId was not passed`);
      throw new BadRequestException(
        `Failed to uninstall widget. AccountId was not passed`,
      );
    }
    this.logger.info('Attempting to find account...');
    const foundAccount = await this.accountRepository.getAccountById(accountId);
    if (!foundAccount) {
      this.logger.error(`Account not found`);
      throw new NotFoundException(`Account not found`);
    }
    foundAccount.installed = false;
    const unInstalledAccount =
      await this.accountRepository.updateAccountByID(foundAccount);
    this.logger.info(`Widget has been uninstalled for ${accountId}`);
    return unInstalledAccount;
  }

  @ErrorHandler()
  public async getPaymentStatus(accountId: number): Promise<boolean> {
    this.logger.info('Attempting to find account...');
    const user = await this.accountRepository.getAccountById(accountId);
    if (!user) {
      this.logger.error(`User not found in database`);
      throw new NotFoundException(`User not found in database`);
    }
    const status = dayjs(user.finishPaymentDate).isBefore(
      dayjs().format('YYYY-MM-DD'),
    );
    if (status) {
      user.testPeriod = false;
      user.paid = false;
      await this.accountRepository.updateAccountByID(user);
    }
    return user.paid || user.testPeriod;
  }

  @ErrorHandler()
  public async getAccount(accountId: number): Promise<AccountDocument> {
    return await this.accountRepository.getAccountById(accountId);
  }

  @ErrorHandler()
  @Cron(CronExpression.EVERY_12_HOURS)
  public async checkPaymentStatus(): Promise<void | HttpException> {
    const users = await this.accountRepository.getAllAccounts();
    if (users.length) {
      for (const user of users) {
        await this.amoApiService.refreshTokens(user);
        const status = dayjs(user.finishPaymentDate).isBefore(
          dayjs().format('YYYY-MM-DD'),
        );
        if (status) {
          user.testPeriod = false;
          user.paid = false;
          await this.accountRepository.updateAccountByID(user);
        }
      }
    } else {
      this.logger.warn('No users was found in database');
    }
  }
}
