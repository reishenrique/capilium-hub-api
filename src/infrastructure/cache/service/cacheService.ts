import CacheStrategy from '../cacheStrategy/abstractCacheStrategy';
import NodeCacheStrategy from '../cacheStrategy/nodeCacheStrategy';
import { CacheStrategiesEnum } from '../enum/CacheStrategies';

export class CacheService {
	private strategyCacheMap = new Map<CacheStrategiesEnum, CacheStrategy>();

	constructor(private readonly _nodeCacheStrategy: NodeCacheStrategy) {
		this.strategyCacheMap.set(
			CacheStrategiesEnum.nodeCache,
			_nodeCacheStrategy,
		);
	}

	public async cacheValue(
		key: string,
		value: any,
		strategy = CacheStrategiesEnum.nodeCache,
	) {
		const strategyCache = this.strategyCacheMap.get(strategy);
		return strategyCache?.setOnCache(key, value);
	}

	public async getCacheValue(
		key: string,
		strategy = CacheStrategiesEnum.nodeCache,
	) {
		const strategyCache = this.strategyCacheMap.get(strategy);
		return strategyCache?.getOnCache(key);
	}

	public async deleteCacheValue(
		key: string,
		strategy = CacheStrategiesEnum.nodeCache,
	) {
		const strategyCache = this.strategyCacheMap.get(strategy);
		return strategyCache?.deleteFromCache(key);
	}

	public async clearAllCacheValues(strategy = CacheStrategiesEnum.nodeCache) {
        const strategyCache = this.strategyCacheMap.get(strategy)
        return strategyCache.clearCache()
    }
}
