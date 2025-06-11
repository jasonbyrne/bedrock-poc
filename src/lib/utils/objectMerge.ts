/**
 * Utility functions for merging objects with different priority behaviors
 */

/**
 * Checks if a value is considered "empty" for backfill purposes.
 * Returns true for null, undefined, empty string, or 0.
 */
function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || value === '' || value === 0;
}

/**
 * Backfill missing or falsy values in the base object with values from overlay objects.
 * The base object has the highest priority - only falsy values will be replaced.
 *
 * @param base - The base object (highest priority, determines return type)
 * @param overlays - Additional objects to use for backfilling missing values
 * @returns A new object with the same type as base, with missing values filled in
 *
 * @example
 * const user = { name: 'John', age: 0, email: '' };
 * const defaults = { age: 25, email: 'default@example.com', role: 'user' };
 * const result = backfillObject(user, defaults);
 * // Result: { name: 'John', age: 25, email: 'default@example.com' }
 * // Note: 'role' is not included because it's not in the base object type
 */
export function backfillObject<T extends object>(
	base: T,
	...overlays: Array<Partial<Record<keyof T, unknown>>>
): T {
	const result = { ...base };

	// Process each key in the base object
	for (const key in base) {
		if (isEmpty(result[key])) {
			// Find the first overlay that has a non-empty value for this key
			for (const overlay of overlays) {
				if (overlay && key in overlay && !isEmpty(overlay[key])) {
					result[key] = overlay[key] as T[typeof key];
					break;
				}
			}
		}
	}

	return result;
}

/**
 * Overlay objects onto a base object, with later objects taking priority.
 * Later overlay objects will overwrite values from earlier objects and the base.
 *
 * @param base - The base object (lowest priority, determines return type structure)
 * @param overlays - Objects to overlay on top, with later ones having higher priority
 * @returns A new object with the same type as base, with values overlaid from other objects
 *
 * @example
 * const defaults = { name: 'Anonymous', age: 0, role: 'guest' };
 * const user = { name: 'John', age: 30 };
 * const admin = { role: 'admin' };
 * const result = overlayObject(defaults, user, admin);
 * // Result: { name: 'John', age: 30, role: 'admin' }
 */
export function overlayObject<T extends Record<string, unknown>>(
	base: T,
	...overlays: Array<Partial<Record<keyof T, unknown>>>
): T {
	const result = { ...base };

	// Apply each overlay in order, with later ones taking priority
	for (const overlay of overlays) {
		if (overlay) {
			for (const key in overlay) {
				if (key in base && overlay[key] !== undefined) {
					result[key] = overlay[key] as T[typeof key];
				}
			}
		}
	}

	return result;
}

/**
 * More flexible version that allows choosing the merge strategy via options
 */
interface MergeOptions {
	/** If true, uses overlay behavior (later wins). If false, uses backfill behavior (base wins) */
	overlayMode?: boolean;
	/** Custom function to determine if a value should be considered "empty" for backfill */
	isEmpty?: (value: unknown) => boolean;
}

/**
 * Flexible object merging with configurable behavior
 *
 * @param base - The base object
 * @param options - Configuration for merge behavior
 * @param overlays - Objects to merge with the base
 */
export function mergeObjects<T extends Record<string, unknown>>(
	base: T,
	options: MergeOptions = {},
	...overlays: Array<Partial<Record<keyof T, unknown>>>
): T {
	const { overlayMode = false, isEmpty: customIsEmpty = isEmpty } = options;

	if (overlayMode) {
		return overlayObject(base, ...overlays);
	}

	const result = { ...base };

	// Process each key in the base object
	for (const key in base) {
		if (customIsEmpty(result[key])) {
			// Find the first overlay that has a non-empty value for this key
			for (const overlay of overlays) {
				if (overlay && key in overlay && !customIsEmpty(overlay[key])) {
					result[key] = overlay[key] as T[typeof key];
					break;
				}
			}
		}
	}

	return result;
}
