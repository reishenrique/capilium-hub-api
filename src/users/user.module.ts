import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controller/user.controller';
import { UserEntity } from './entity/users.entity';
import { UsersSchema } from './schemas/users.schema';
import { UserService } from './service/user.service';
import { UserRepository } from './repository/user.repository';
import userProvider from './user.provider';

@Module({
	controllers: [UserController],
	imports: [
		MongooseModule.forFeature([
			{
				name: UserEntity.name,
				schema: UsersSchema,
			},
		]),
	],
	providers: userProvider,
	exports: [MongooseModule, UserRepository, UserService],
})
export class UserModule {}
