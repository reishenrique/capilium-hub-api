import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoggerDocument } from './schemas/logger.schema';
import { Log } from './entity/logger.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { LogEventEnum } from './enum/log-event.enum';
import { LogLevelEnum } from './enum/log-level.enum';

@Injectable()
export class LoggerService {
	protected readonly _logger = new Logger('LoggerService');
	constructor(
		@InjectModel(Log.name) private loggerModel: Model<LoggerDocument>,
	) {}

	@OnEvent(LogEventEnum.InternalLog)
	async handleInternalLogger(payload: {
		level: LogLevelEnum;
		message: string;
		context?: string;
		data?: Record<string, string>;
	}) {
		await this.loggerModel.create(payload);
	}
}
