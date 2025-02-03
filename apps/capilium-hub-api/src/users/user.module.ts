import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './presentation/user.controller';
import { User } from './entity/users.entity';
import { UsersSchema } from './schemas/users.schema';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { CacheModule } from '../infrastructure/cache/cache.module';
import { BullModule } from '@nestjs/bull';
import { EMAIL_QUEUE, SharedModule } from '@app/shared';

@Module({
	imports: [
		CacheModule,
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UsersSchema,
			},
		]),
		BullModule.registerQueue({
			name: EMAIL_QUEUE,
		}),
		SharedModule,
	],
	controllers: [UserController],
	providers: [UserService, UserRepository],
	exports: [MongooseModule, UserService, UserRepository],
})
export class UserModule {}
