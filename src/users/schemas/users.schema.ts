import { SchemaFactory } from '@nestjs/mongoose';
import { UserEntity } from '../entity/users.entity';
import type { Document } from 'mongoose';

export type UserDocument = UserEntity & Document;

export const UsersSchema = SchemaFactory.createForClass(UserEntity);
