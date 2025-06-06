import type { WebQuery } from "$lib/server/domain/query/web";
import type { Repository } from "$lib/server/domain/repository";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			repo: Repository;
			query: WebQuery;
		}
	}
}

export {};
