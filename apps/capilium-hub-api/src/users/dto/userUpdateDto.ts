import { PartialType } from '@nestjs/swagger';
import { UserCreateDto } from './userCreateDto';

export class UserUpdateDto extends PartialType(UserCreateDto) {}
