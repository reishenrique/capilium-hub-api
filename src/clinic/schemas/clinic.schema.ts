import { ClinicEntity } from '../entity/clinic.entity';
import type { Document } from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';

export type ClinicDocument = ClinicEntity & Document;

export const ClinicSchema = SchemaFactory.createForClass(ClinicEntity);
