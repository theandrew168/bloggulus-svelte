import type { Config } from "$lib/server/config/config";
import type { WebQuery } from "$lib/server/query/web";
import type { Repository } from "$lib/server/repository/repository";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			config: Config;
			// TODO: This should be removed once "command" is added.
			repo: Repository;
			query: WebQuery;
		}
	}
}

export {};
