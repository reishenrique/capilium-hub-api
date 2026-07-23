import { EMAIL_QUEUE } from '@app/shared';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { send } from 'apps/queue/common/utils/mailerUtils';
import { Job } from 'bull';
import { IEmailJobData } from 'apps/queue/common/interfaces/IEmailJobData';

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
	private _logger = new Logger(EmailProcessor.name);

	@Process('send-email')
	async handle(job: Job<IEmailJobData>) {
		const { to, subject, body, metadata } = job.data;

		try {
			send(to, subject, body);

			this._logger.log(
				`Email sent successfully to ${to} | Data: ${JSON.stringify(job.data, null, 2)}`,
			);
		} catch (error) {
			if (error instanceof Error) {
				this._logger.error(
					`Failed to send email (Type: ${metadata?.emailType}) to ${to} | Error: ${error.message}
			`,
					error.stack,
				);
			} else {
				this._logger.error(
					`Failed to send email (Type: ${metadata?.emailType} to ${to} | Unknown error)`,
					String(error),
				);
			}

			throw error;
		}
	}
}
