import { SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { Application } from '../entity/application.entity';

export type ApplicationDocument = Application & Document;

export const ApplicationSchema = SchemaFactory.createForClass(Application);
