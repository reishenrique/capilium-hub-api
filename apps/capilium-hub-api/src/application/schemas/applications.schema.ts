import { SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { Application } from '../entity/application.entity';

export type ApplicationDocument = HydratedDocument<Application>;

export const ApplicationSchema = SchemaFactory.createForClass(Application);
