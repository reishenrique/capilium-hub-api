import { SchemaFactory } from '@nestjs/mongoose';
import { User } from '../entity/users.entity';
import type { Document } from 'mongoose';

export type UserDocument = User & Document;

export const UsersSchema = SchemaFactory.createForClass(User);
