import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheController } from './presentation/cache.controller';
import NodeCacheStrategy from './cacheStrategy/nodeCacheStrategy';

@Global()
@Module({
	controllers: [CacheController],
	providers: [CacheService, NodeCacheStrategy],
	exports: [CacheService],
})
export class CacheModule {}
