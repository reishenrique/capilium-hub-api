import { EMAIL_QUEUE } from '@app/shared';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { send } from 'apps/capilium-hub-api/src/common/utils/mailerUtils';
import { Job } from 'bull';

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
	private _logger = new Logger(EmailProcessor.name);

	@Process('send-email')
	async handleEmailJob(job: Job) {
		const { to, subject, body } = job.data;

		await send(to, subject, body);
		this._logger.debug(job.data);
	}
}
