import type { Handle } from "@sveltejs/kit";

import { Command } from "$lib/server/command";
import { EnvConfig } from "$lib/server/config/env";
import { Connection } from "$lib/server/postgres";
import { PostgresWebQuery } from "$lib/server/query/postgres/web";
import { SESSION_COOKIE_NAME } from "$lib/server/web/cookies";

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

	const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
	if (sessionToken) {
		event.locals.account = await event.locals.query.readAccountBySessionToken(sessionToken);
	}

	return resolve(event);
};
