import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './account.model';
import { Model } from 'mongoose';
import { LoggerService } from 'src/core/logger/logger.service';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<Account>,
    private readonly logger: LoggerService
  ) {}

  public async getAllAccounts(): Promise<AccountDocument[]> {
    try {
      return await this.accountModel.find().lean();
    } catch (error: unknown) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getAccountById(accountId: number): Promise<AccountDocument> {
    try {
      return await this.accountModel.findOne({ accountId: accountId });
    } catch (error: unknown) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async createAccount(accountInfo: Account): Promise<AccountDocument> {
    try {
      return await this.accountModel.create(accountInfo);
    } catch (error: unknown) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async updateAccountByID(
    accountInfo: AccountDocument,
  ): Promise<AccountDocument> {
    try {
      return await accountInfo.save();
    } catch (error: unknown) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
