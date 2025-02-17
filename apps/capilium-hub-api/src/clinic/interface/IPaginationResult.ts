export interface IPaginationResult<T> {
	totalDocuments: number;
	totalPages: number;
	currentPage: number;
	results: T[];
}
