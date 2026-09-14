import { EMAIL_QUEUE } from '@app/shared';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { send } from 'apps/queue/common/utils/mailerUtils';
import { Job } from 'bull';
import { IEmailJobData } from 'apps/queue/common/interfaces/IEmailJobData';
import { CacheService } from 'apps/capilium-hub-api/src/infrastructure/cache/cache.service';
import EventEmitter2 from 'eventemitter2';
import { LogEventEnum } from 'apps/capilium-hub-api/src/logger/enum/log-event.enum';
import { LogLevelEnum } from 'apps/capilium-hub-api/src/logger/enum/log-level.enum';

@Processor(EMAIL_QUEUE)
export class EmailWorker {
	private _logger = new Logger(EmailWorker.name);
	constructor(
		private readonly cacheService: CacheService,
		private eventEmitter: EventEmitter2,
	) {}

	@Process('send-email')
	async handle(job: Job<IEmailJobData>) {
		const { to, subject, body, metadata } = job.data;

		try {
			const cachedIdempotecyKey = await this.cacheService.get(
				metadata.idempotencyKey,
			);

			if (cachedIdempotecyKey) {
				this._logger.log(
					`Email already processed. Idempotecy key: ${metadata.idempotencyKey}`,
				);

				this.eventEmitter.emit(LogEventEnum.InternalLog, {
					level: LogLevelEnum.Info,
					message: 'Welcome email already processed previously',
					context: 'Mailer Processor',
					data: {
						email: to,
					},
				});

				return;
			}

			send(to, subject, body);

			const TWENTY_FOUR_HOURS_TTL = 86400;

			await this.cacheService.set(
				metadata.idempotencyKey,
				true,
				TWENTY_FOUR_HOURS_TTL,
			);

			this._logger.log(
				`Email sent successfully to ${to} | Data: ${JSON.stringify(job.data, null, 2)}`,
			);

			this.eventEmitter.emit(LogEventEnum.InternalLog, {
				level: LogLevelEnum.Info,
				message: 'Sending welcome email to new user',
				context: 'MailerProcessor',
				data: {
					email: to,
				},
			});
		} catch (error) {
			if (error instanceof Error) {
				this._logger.error(`Error: ${error.message}`, error.stack);

				this.eventEmitter.emit(LogEventEnum.InternalLog, {
					level: LogLevelEnum.Error,
					message: `Failed to send email (type: ${metadata?.emailType}) to ${to}`,
					context: 'MailerProcessor',
				});
			}

			this._logger.error(
				`Failed to send email (Type: ${metadata?.emailType} to ${to} | Unknown error)`,
				String(error),
			);

			throw error;
		}
	}
}
