import { ICache } from '../interfaces/ICache';

export default abstract class CacheStrategy implements ICache {
	abstract setOnCache(key: string, value: any, ttl?: number): boolean;
	abstract getOnCache(key: string): any;
	abstract deleteFromCache(key: string): void;
	abstract clearCache(): void;
}
