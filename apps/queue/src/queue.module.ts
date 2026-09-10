import { EMAIL_QUEUE, SharedModule } from '@app/shared';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EmailWorker } from './mailer/email.worker';

@Module({
	imports: [
		SharedModule,
		BullModule.registerQueue({
			name: EMAIL_QUEUE,
		}),
	],
	providers: [EmailWorker],
})
export class QueueModule {}
