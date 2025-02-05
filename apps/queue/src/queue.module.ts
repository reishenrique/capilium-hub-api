import { EMAIL_QUEUE, SharedModule } from '@app/shared';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EmailProcessor } from './mailer/mailer.processor';

@Module({
	imports: [
		SharedModule,
		BullModule.registerQueue({
			name: EMAIL_QUEUE,
		}),
	],
	providers: [EmailProcessor],
})
export class QueueModule {}
