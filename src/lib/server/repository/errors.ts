import type { UUID } from "$lib/types";

export class ConcurrentUpdateError extends Error {
	constructor(resource: string, id: UUID) {
		super(`Concurrent update detected: ${resource} ${id}`);
		this.name = "ConcurrentUpdateError";
	}
}
