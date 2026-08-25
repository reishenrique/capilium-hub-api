import { Injectable } from '@nestjs/common';
import NodeCacheStrategy from './strategy/node-cache.strategy';
import { CacheStrategiesEnum } from './enum/CacheStrategies';
import AbstractCacheStrategy from './strategy/abstract-cache.strategy';
import RedisCacheStrategy from './strategy/redis-cache.strategy';

@Injectable()
export class CacheService {
	private strategyCacheMap = new Map<
		CacheStrategiesEnum,
		AbstractCacheStrategy
	>();

	constructor(
		private readonly nodeCacheStrategy: NodeCacheStrategy,
		private readonly redisCacheStrategy: RedisCacheStrategy,
	) {
		this.strategyCacheMap.set(CacheStrategiesEnum.nodeCache, nodeCacheStrategy);

		this.strategyCacheMap.set(
			CacheStrategiesEnum.redisCache,
			redisCacheStrategy,
		);
	}

	public async set(
		key: string,
		value: any,
		strategy = CacheStrategiesEnum.nodeCache,
	) {
		const strategyCache = this.strategyCacheMap.get(strategy);
		return strategyCache?.set(key, value);
	}

	public async get(key: string, strategy = CacheStrategiesEnum.nodeCache) {
		const strategyCache = this.strategyCacheMap.get(strategy);
		return strategyCache?.get(key);
	}

	public async delete(key: string, strategy = CacheStrategiesEnum.nodeCache) {
		const strategyCache = this.strategyCacheMap.get(strategy);
		return strategyCache?.delete(key);
	}

	public async clear(strategy = CacheStrategiesEnum.nodeCache) {
		const strategyCache = this.strategyCacheMap.get(strategy);
		return strategyCache.clear();
	}
}
