import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as dayjs from 'dayjs';
import { HydratedDocument } from 'mongoose';
import {
  getEndOfTrialPeriodDate,
  getStartUsingDate,
} from 'src/core/helpers/calculate-trial-period';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account {
  @ApiProperty({})
  @Prop({ required: true })
  public accountId: number;

  @Prop({ required: true })
  public accessToken: string;

  @Prop({ required: true })
  public refreshToken: string;

  @Prop({ required: true })
  public subdomain: string;

  @Prop({ required: true, default: true })
  public installed: boolean;

  @Prop({ required: true, default: getStartUsingDate() })
  public startUsingDate: string;

  @Prop({ required: false, default: getEndOfTrialPeriodDate(dayjs()) })
  public finishPaymentDate: string;

  @Prop({ required: true, default: true })
  public testPeriod: boolean;

  @Prop({ required: true, default: false })
  public paid: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
