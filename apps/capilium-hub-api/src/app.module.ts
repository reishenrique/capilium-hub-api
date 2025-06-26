import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { CacheModule } from './infrastructure/cache/cache.module';
import { ClinicModule } from './clinic/clinic.module';
import { SharedModule } from '@app/shared';
import { OpportunityModule } from './opportunity/opportunity.module';
import { AuthModule } from './auth/auth.module';
import { ApplicationModule } from './application/application.module';
import { UploadModule } from './upload/upload.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from './logger/logger.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		MongooseModule.forRoot(process.env.DATABASE_URL, {
			maxPoolSize: Number(process.env.MAX_POOL_SIZE_MONGO) || 50,
			minPoolSize: Number(process.env.MIN_POOL_SIZE_MONGO) || 5,
		}),
		ThrottlerModule.forRoot([
			{
				ttl: Number(process.env.RATE_LIMIT_TIME) || 10000,
				limit: Number(process.env.RATE_LIMIT_AMOUNT_REQUESTS) || 10,
				skipIf: (context) => {
					const className = context.getClass()?.name;
					return className !== 'UserController';
				},
			},
		]),
		EventEmitterModule.forRoot(),
		LoggerModule,
		UserModule,
		CacheModule,
		ClinicModule,
		OpportunityModule,
		SharedModule,
		AuthModule,
		ApplicationModule,
		UploadModule,
	],
	controllers: [],
	providers: [SharedModule],
})
export class AppModule {}
