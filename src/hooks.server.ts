import type { Handle } from "@sveltejs/kit";

import { Command } from "$lib/server/command/command";
import { EnvConfig } from "$lib/server/config/config";
import { Connection } from "$lib/server/postgres/connection";
import { PostgresWebQuery } from "$lib/server/query/postgres/web";

// Be sure to close the database connection when the server shuts down.
// Otherwise, the NodeJS process will hang indefinitely.
process.on("sveltekit:shutdown", async () => {
	const conn = Connection.getInstance();
	await conn.close();
});

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.config = EnvConfig.getInstance();
	event.locals.command = Command.getInstance();
	event.locals.query = PostgresWebQuery.getInstance();
	return resolve(event);
};
