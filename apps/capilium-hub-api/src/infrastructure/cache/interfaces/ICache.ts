export interface ICache {
	set<T>(key: string, value: T, ttl: number): Promise<void>;
	get<T>(key: string): Promise<T | undefined>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;
}
