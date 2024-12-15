import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
	imports: [
		MongooseModule.forRoot(process.env.DATABASE_URL, {
			maxPoolSize: Number(process.env.MAX_POOL_SIZE_MONGO) || 50,
			minPoolSize: Number(process.env.MIN_POOL_SIZE_MONGO) || 5,
		}),
		ThrottlerModule.forRoot([
			{
				ttl: Number(process.env.RATE_LIMIT_TIME) || 10000,
				limit: Number(process.env.RATE_LIMIT_AMOUNT_REQUESTS) || 10,
				skipIf(context) {
					return context.getClass().name !== 'UserController';
				},
			},
		]),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
