import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './presentation/user.controller';
import { UserEntity } from './entity/users.entity';
import { UsersSchema } from './schemas/users.schema';
import { UserService } from './service/user.service';
import { UserRepository } from './repository/user.repository';
import { CacheModule } from 'src/infrastructure/cache/cache.module';

@Module({
	imports: [
		CacheModule,
		MongooseModule.forFeature([
			{
				name: UserEntity.name,
				schema: UsersSchema,
			},
		]),
	],
	controllers: [UserController],
	providers: [UserService, UserRepository],
	exports: [MongooseModule, UserService, UserRepository],
})
export class UserModule {}
