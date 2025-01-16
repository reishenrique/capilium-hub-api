import NodeCache from 'node-cache';
import CacheStrategy from './abstractCacheStrategy';

export default class NodeCacheStrategy extends CacheStrategy {
	private myCache = new NodeCache({
		stdTTL: 86400,
	});

	public setOnCache(key: string, value: any, ttl?: number): boolean {
		if (ttl !== undefined) {
			return this.myCache.set(key, value, ttl);
		}

		return this.myCache.set(key, value);
	}

	public getOnCache(key: string): any {
		return this.myCache.get(key);
	}

	public deleteFromCache(key: string) {
		return this.myCache.del(key);
	}

	public clearCache(): void {
		return this.myCache.flushAll();
	}
}
