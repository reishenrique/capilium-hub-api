import { EMAIL_QUEUE, SharedModule } from '@app/shared';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EmailWorker } from './mailer/email.worker';
import { CacheService } from 'apps/capilium-hub-api/src/infrastructure/cache/cache.service';
import { CacheModule } from 'apps/capilium-hub-api/src/infrastructure/cache/cache.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
	imports: [
		SharedModule,
		BullModule.registerQueue({
			name: EMAIL_QUEUE,
		}),
		CacheModule,
		EventEmitterModule.forRoot(),
	],
	providers: [EmailWorker],
})
export class QueueModule {}
