import { SchemaFactory } from '@nestjs/mongoose';
import { Opportunity } from '../entity/opportunity.entity';
import type { Document } from 'mongoose';

export type OpportunityDocument = Opportunity & Document;

export const OpportunitySchema = SchemaFactory.createForClass(Opportunity);
