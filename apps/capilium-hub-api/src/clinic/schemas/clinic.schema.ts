import { Clinic } from '../entity/clinic.entity';
import type { Document } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';

export type ClinicDocument = Clinic & Document;

export const ClinicSchema = SchemaFactory.createForClass(Clinic);
