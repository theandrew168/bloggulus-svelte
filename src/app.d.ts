import type { Command } from "#lib/server/command/index.js";
import type { Config } from "#lib/server/config/index.js";
import type { WebQuery } from "#lib/server/query/web/index.js";
import type { Account } from "#lib/types.js";

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
