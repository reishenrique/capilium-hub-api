import NodeCache from 'node-cache';
import AbstractCacheStrategy from './abstract-cache.strategy';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class NodeCacheStrategy extends AbstractCacheStrategy {
	private nodeCache = new NodeCache({
		stdTTL: 86400,
	});

	public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		this.nodeCache.set(key, value, ttl);
	}

	public async get<T>(key: string): Promise<T | undefined> {
		return this.nodeCache.get<T>(key);
	}

	public async delete(key: string): Promise<void> {
		this.nodeCache.del(key);
	}

	public async clear(): Promise<void> {
		this.nodeCache.flushAll();
	}
}
