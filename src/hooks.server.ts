import type { Handle } from "@sveltejs/kit";

import { Command } from "$lib/server/command/command";
import { EnvConfig } from "$lib/server/config/config";
import { PostgresWebQuery } from "$lib/server/query/postgres/web";

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.config = EnvConfig.getInstance();
	event.locals.command = Command.getInstance();
	event.locals.query = PostgresWebQuery.getInstance();
	return resolve(event);
};
