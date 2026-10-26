export function isDuplicateKeyError(error: unknown): boolean {
	return (error as { code?: number })?.code === 11000;
}
