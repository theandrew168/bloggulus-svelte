export type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

export function Ok<T>(data: T): Result<T> {
	return { ok: true, data };
}

export function Err<E = Error>(error: E): Result<never, E> {
	return { ok: false, error };
}

export type Option<T> = { exists: true; data: T } | { exists: false };

export function Some<T>(data: T): Option<T> {
	return { exists: true, data };
}

export function None(): Option<never> {
	return { exists: false };
}

/**
 * Sets up global helper functions for the Option and Result types.
 */
export function setupGlobals(): void {
	globalThis.None = None;
	globalThis.Some = Some;

	globalThis.Ok = Ok;
	globalThis.Err = Err;
}
