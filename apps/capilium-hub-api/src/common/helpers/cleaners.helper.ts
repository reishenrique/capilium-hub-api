export function removeNonNumeric(input: string): string {
	return input.replace(/\D/g, '');
}
