import type { InternalError } from "./errors";

export type Result<T, E = InternalError> = { ok: true; data: T } | { ok: false; error: E };

export function Ok<T>(data: T): Result<T> {
	return { ok: true, data };
}

export function Err<E = InternalError>(error: E): Result<never, E> {
	return { ok: false, error };
}
