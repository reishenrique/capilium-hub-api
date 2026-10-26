import { SchemaFactory } from '@nestjs/mongoose';
import { Opportunity } from '../entity/opportunity.entity';
import type { HydratedDocument } from 'mongoose';

export type OpportunityDocument = HydratedDocument<Opportunity>;

export const OpportunitySchema = SchemaFactory.createForClass(Opportunity);

OpportunitySchema.index({ clinicId: 1 });
