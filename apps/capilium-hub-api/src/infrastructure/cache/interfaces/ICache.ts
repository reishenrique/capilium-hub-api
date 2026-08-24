export interface ICache {
	set<T>(key: string, value: T, ttl: number): void;
	get<T>(key: string): T | undefined;
	delete(key: string): void;
	clear(): void;
}
