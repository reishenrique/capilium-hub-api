import type { Document } from 'mongoose';
import { Log } from '../entity/logger.entity';
import { SchemaFactory } from '@nestjs/mongoose';

export type LoggerDocument = Log & Document;

export const LoggerSchema = SchemaFactory.createForClass(Log);
