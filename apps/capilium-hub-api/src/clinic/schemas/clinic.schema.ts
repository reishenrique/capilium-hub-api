import { Clinic } from '../entity/clinic.entity';
import type { HydratedDocument } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';

export type ClinicDocument = HydratedDocument<Clinic>;

export const ClinicSchema = SchemaFactory.createForClass(Clinic);
