import { Inject, Injectable } from '@nestjs/common';
import AbstractCacheStrategy from './abstract-cache.strategy';
import Redis from 'ioredis';

@Injectable()
export default class RedisCacheStrategy extends AbstractCacheStrategy {
	constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
		super();
	}

	public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
		const serializedValue = JSON.stringify(value);

		if (ttl !== undefined) {
			await this.redis.set(key, serializedValue, 'EX', ttl);
			return;
		}

		await this.redis.set(key, serializedValue);
	}

	public async get<T>(key: string): Promise<T | undefined> {
		const value = await this.redis.get(key);

		if (!value) return undefined;

		return JSON.parse(value) as T;
	}
}
