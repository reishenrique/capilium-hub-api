import { Injectable, NotFoundException } from '@nestjs/common';
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

	private readonly defaultCacheStrategy: CacheStrategiesEnum;

	constructor(
		private readonly nodeCacheStrategy: NodeCacheStrategy,
		private readonly redisCacheStrategy: RedisCacheStrategy,
	) {
		this.strategyCacheMap.set(CacheStrategiesEnum.nodeCache, nodeCacheStrategy);

		this.strategyCacheMap.set(
			CacheStrategiesEnum.redisCache,
			redisCacheStrategy,
		);

		this.defaultCacheStrategy = process.env
			.CACHE_STRATEGY as CacheStrategiesEnum;
	}

	public async set<T>(
		key: string,
		value: T,
		strategy?: CacheStrategiesEnum,
	): Promise<void> {
		const selectedStrategy = strategy ?? this.defaultCacheStrategy;

		const strategyCache = this.strategyCacheMap.get(selectedStrategy);
		return strategyCache.set<T>(key, value);
	}

	public async get<T>(
		key: string,
		strategy?: CacheStrategiesEnum,
	): Promise<T | undefined> {
		const selectedStrategy = strategy ?? this.defaultCacheStrategy;
		const strategyCache = this.strategyCacheMap.get(selectedStrategy);

		return strategyCache.get<T>(key);
	}

	public async delete(
		key: string,
		strategy?: CacheStrategiesEnum,
	): Promise<void> {
		const selectedStrategy = strategy ?? this.defaultCacheStrategy;

		const strategyCache = this.strategyCacheMap.get(selectedStrategy);
		return strategyCache.delete(key);
	}

	public async clear(strategy?: CacheStrategiesEnum): Promise<void> {
		const selectedStrategy = strategy ?? this.defaultCacheStrategy;

		const strategyCache = this.strategyCacheMap.get(selectedStrategy);
		return strategyCache.clear();
	}

	private getStrategyCache(
		strategy?: CacheStrategiesEnum,
	): AbstractCacheStrategy {
		const selectedStrategy = strategy ?? this.defaultCacheStrategy;

		const strategyCacheIntoMapper = this.strategyCacheMap.get(selectedStrategy);

		if (!strategyCacheIntoMapper) {
			throw new NotFoundException(
				`Cache strategy "${selectedStrategy}" not found`,
			);
		}

		return strategyCacheIntoMapper;
	}
}
