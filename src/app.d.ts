import type { WebQuery } from "$lib/server/query/web";
import type { Repository } from "$lib/server/repository/repository";

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
