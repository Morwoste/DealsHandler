import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isEnum } from 'class-validator';
import { AccountRepository } from '../account/account.repository';
import { LoggerService } from 'src/core/logger/logger.service';
import { Deal } from '../amo-api/types/amo-api.types';
import { DealDocument, DealModel } from './deals.model';
import { CustomFieldTypes } from 'src/core/consts/custom-fields-types';
import { AmoApiService } from '../amo-api/amo-api.service';

@Injectable()
export class DealsRepository {
    constructor(
        @InjectModel(DealModel.name)
        private readonly dealsModel: Model<DealModel>,
        private readonly accountRepository: AccountRepository,
        private readonly amoApiService: AmoApiService,
        private readonly logger: LoggerService
    ) {}

    public async saveDealsLinkedToPipeline(deals: Deal[]): Promise<void> {
        try {
            const dealsToCreate = deals.map(
                ({
                    account_id,
                    id,
                    responsible_user_id,
                    pipeline_id,
                    custom_fields_values,
                }) => ({
                    accountId: account_id,
                    id: id,
                    responsibleUserId: responsible_user_id,
                    pipline: pipeline_id,
                    customFields: custom_fields_values?.filter((customField) =>
                        isEnum(customField.field_type, CustomFieldTypes)
                    ),
                })
            );
            const dealsChunkLimitSize = 5000;
            for (
                let counter = 0;
                counter < dealsToCreate.length;
                counter += dealsChunkLimitSize
            ) {
                const chunk = dealsToCreate.slice(
                    counter,
                    counter + dealsChunkLimitSize
                );
                await this.dealsModel.insertMany(chunk);
            }
        } catch (error) {
            this.logger.error(`Error while creating deals error: ${error}`);
            throw new InternalServerErrorException(
                `Error while creating deals error: ${error}`
            );
        }
    }

    // public async getDealsByGoalField(
    //     goalField: number
    // ): Promise<DealDocument[]> {
    //     try {
    //         return await this.dealsModel.find({
    //             customFields: { field_id: goalField },
    //         });
    //     } catch (error) {
    //         this.logger.error(
    //             `Error while getting deals by goal field error: ${error}`
    //         );
    //         throw new InternalServerErrorException(
    //             `Error while getting deals by goal field`
    //         );
    //     }
    // }
}
