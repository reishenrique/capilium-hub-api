import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerService } from './logger.service';
import { LoggerSchema } from './schemas/logger.schema';
import { Log } from './entity/logger.entity';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Log.name, schema: LoggerSchema }]),
	],
	providers: [LoggerService],
})
export class LoggerModule {}
