import { SchemaFactory } from '@nestjs/mongoose';
import { User } from '../entity/users.entity';
import type { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export const UsersSchema = SchemaFactory.createForClass(User);
