/**
 * Convert a value to a string.
 * @param value - The value to convert.
 * @param defaultValue - The default value to return if the value is not a string.
 * @returns The string value of the value, or the default value if the value is not a string.
 */
export function toString(value: unknown, defaultValue: string): string;
export function toString(value: unknown, defaultValue: null): string | null;
export function toString(value: unknown): string | null;
export function toString(value: unknown, defaultValue: string | null = null): string | null {
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return value.toString();
	if (typeof value === 'boolean') return value.toString();
	if (typeof value === 'object' && value !== null) return JSON.stringify(value);
	return defaultValue;
}
