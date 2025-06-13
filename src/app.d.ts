import type { Command } from "$lib/server/command";
import type { Config } from "$lib/server/config";
import type { WebQuery } from "$lib/server/query/web";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			config: Config;
			command: Command;
			query: WebQuery;
		}
	}
}

export {};
