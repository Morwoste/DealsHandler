import { Injectable } from '@nestjs/common';
import { ErrorHandler } from 'src/core/decorators/IsRequestSuccess.decorator';
import {
    Deal,
    Pipeline,
    PipelineWithStatuses,
} from '../amo-api/types/amo-api.types';
import { DealsRepository } from './deals.repository';
import { AmoApiService } from '../amo-api/amo-api.service';
import { UnnecessaryPipelinesStatuses } from 'src/core/consts/pipelines-statuses';

@Injectable()
export class DealsService {
    constructor(
        private readonly dealsRepository: DealsRepository,
        private readonly amoApiService: AmoApiService
    ) {}

    @ErrorHandler()
    public async saveDealsLinkedToPipeline(accountId: number): Promise<void> {
        const pipelines =
            await this.amoApiService.getPipelinesByAccount(accountId);
        const pipelinesWithStatuses = this.bindPipelinesToStatuses(pipelines);
        const deals = await this.amoApiService.getDeals(
            accountId,
            pipelinesWithStatuses
        );
        await this.dealsRepository.saveDealsLinkedToPipeline(deals);
    }

    public bindPipelinesToStatuses(
        pipelines: Pipeline[]
    ): PipelineWithStatuses[] {
        return pipelines
            .map((pipeline) => {
                const filteredStatuses = pipeline._embedded.statuses.filter(
                    (status) =>
                        status.id !== UnnecessaryPipelinesStatuses.Unrealized
                );
                return filteredStatuses.map((status) => ({
                    pipeline_id: pipeline.id,
                    status_id: status.id,
                }));
            })
            .flat();
    }

    // @ErrorHandler()
    // public async getDealsByFields(goalField: number, dateField: number) {
    //     const foundDeals =
    //         await this.dealsRepository.getDealsByGoalField(goalField);
    //     const deals = foundDeals.filter((deal) =>
    //         deal.customFields.filter(
    //             (field) => field.field_id === dateField || goalField
    //         )
    //     );
    //     return deals;
    // }
}
