import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheController } from './presentation/cache.controller';
import NodeCacheStrategy from './strategy/node-cache.strategy';
import RedisCacheStrategy from './strategy/redis-cache.strategy';

@Global()
@Module({
	controllers: [CacheController],
	providers: [CacheService, NodeCacheStrategy, RedisCacheStrategy],
	exports: [CacheService],
})
export class CacheModule {}
