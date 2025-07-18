import type { Command } from "$lib/server/command";
import type { Config } from "$lib/server/config";
import type { WebQuery } from "$lib/server/query/web";
import type { Account } from "$lib/types";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			config: Config;
			command: Command;
			query: WebQuery;

			account?: Account;
		}
	}
}

export {};
