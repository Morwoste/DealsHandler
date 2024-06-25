import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CustomField } from 'src/core/types/amo-element-types';

export type DealDocument = HydratedDocument<DealModel>;

@Schema({ timestamps: true })
export class DealModel {
    @Prop({ required: true, index: true })
    public accountId: number;

    @Prop({ required: true, index: true })
    public id: number;

    @Prop({ required: true, index: true })
    public responsibleUserId: number;

    @Prop({ required: true, index: true })
    public pipeline: number;

    @Prop({ required: true, default: [] })
    public customFields: CustomField[];
}

export const DealSchema = SchemaFactory.createForClass(DealModel);
