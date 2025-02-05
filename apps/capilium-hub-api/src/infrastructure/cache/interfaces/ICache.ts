export interface ICache {
	setOnCache(key: string, value: any, ttl: number): boolean;
	getOnCache(key: string): any;
	deleteFromCache(key: string): void;
	clearCache(): void;
}
