import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoggerDocument } from './schemas/logger.schema';
import { Log } from './entity/logger.entity';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class LoggerService {
	protected readonly _logger = new Logger('LoggerService');
	constructor(
		@InjectModel(Log.name) private loggerModel: Model<LoggerDocument>,
	) {}

	@OnEvent('log.internal')
	async handleInternalLogger(payload: {
		level: string;
		message: string;
		context?: string;
		data?: Record<string, string>;
	}) {
		await this.loggerModel.create(payload);
	}
}
