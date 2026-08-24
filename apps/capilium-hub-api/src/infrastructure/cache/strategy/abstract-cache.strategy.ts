import { Injectable } from '@nestjs/common';
import { ICache } from '../interfaces/ICache';

@Injectable()
export default abstract class AbstractCacheStrategy implements ICache {
	abstract set<T>(key: string, value: T, ttl?: number): void;
	abstract get<T>(key: string): T | undefined;
	abstract delete(key: string): void;
	abstract clear(): void;
}
