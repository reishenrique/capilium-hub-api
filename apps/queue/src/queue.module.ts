import { EMAIL_QUEUE, SharedModule } from '@app/shared';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

@Module({
	imports: [
		SharedModule,
		BullModule.registerQueue({
			name: EMAIL_QUEUE,
		}),
	],
})
export class QueueModule {}
