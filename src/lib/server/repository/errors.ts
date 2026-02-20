import { InternalError } from "$lib/server/types/errors";
import type { UUID } from "$lib/types";

export class ConcurrentUpdateError extends InternalError {
	constructor(resource: string, id: UUID) {
		super(`Concurrent update detected: ${resource} ${id}`);
		this.name = "ConcurrentUpdateError";
	}
}
