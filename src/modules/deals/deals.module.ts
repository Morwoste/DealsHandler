import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DealsService } from './deals.service';
import { DealsRepository } from './deals.repository';
import { LoggerService } from 'src/core/logger/logger.service';
import { DealModel, DealSchema } from './deals.model';
import { AccountModule } from '../account/account.module';

@Module({
    imports: [
        AccountModule,
        MongooseModule.forFeature([
            { name: DealModel.name, schema: DealSchema },
        ]),
    ],
    providers: [DealsService, DealsRepository, LoggerService],
    controllers: [],
    exports: [],
})
export class DealsModule {}
