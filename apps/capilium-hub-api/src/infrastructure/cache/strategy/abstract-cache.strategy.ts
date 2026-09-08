import { Injectable } from '@nestjs/common';
import { ICache } from '../interfaces/ICache';

@Injectable()
export default abstract class AbstractCacheStrategy implements ICache {
	public abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
	public abstract get<T>(key: string): Promise<T | undefined>;
	public abstract delete(key: string): Promise<void>;
	public abstract clear(): Promise<void>;
}
