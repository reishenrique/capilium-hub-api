import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
			validationSchema: Joi.object({
				REDIS_HOST: Joi.string().required(),
				REDIS_PORT: Joi.string().required(),
				REDIS_PASSWORD: Joi.string().required(),
			}),
		}),

		BullModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				redis: {
					host: configService.getOrThrow('REDIS_HOST'),
					port: configService.getOrThrow('REDIS_PORT'),
					password: configService.getOrThrow('REDIS_PASSWORD'),
				},
			}),
		}),
	],
	exports: [BullModule],
})
export class SharedModule {}
