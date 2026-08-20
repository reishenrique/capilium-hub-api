import { Injectable } from '@nestjs/common';
import { ICache } from '../interfaces/ICache';

@Injectable()
export default abstract class AbstractCacheStrategy implements ICache {
	abstract setOnCache(key: string, value: any, ttl?: number): boolean;
	abstract getOnCache(key: string): any;
	abstract deleteFromCache(key: string): void;
	abstract clearCache(): void;
}
