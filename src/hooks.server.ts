import type { Handle } from "@sveltejs/kit";
import { Cron } from "croner";

import { Command } from "$lib/server/command";
import { EnvConfig } from "$lib/server/config/env";
import { Connection } from "$lib/server/postgres";
import { PostgresWebQuery } from "$lib/server/query/postgres/web";
import { SESSION_COOKIE_NAME } from "$lib/server/web/cookies";

const config = EnvConfig.getInstance();
const command = Command.getInstance();
const query = PostgresWebQuery.getInstance();

function jobErrorHandler(e: unknown) {
	console.log(e);
}

// Delete expired sessions every minute.
const deleteExpiredSessionsJob = new Cron("* * * * *", { catch: jobErrorHandler }, async () => {
	const now = new Date();
	await command.auth.deleteExpiredSessions(now);
});
deleteExpiredSessionsJob.trigger();

// Sync all blogs every 30 minutes.
const syncAllBlogsJob = new Cron("*/30 * * * *", { catch: jobErrorHandler }, async () => {
	await command.sync.syncAllBlogs();
});
syncAllBlogsJob.trigger();

// Be sure to close the database connection when the server shuts down.
// Otherwise, the NodeJS process will hang indefinitely.
process.on("sveltekit:shutdown", async () => {
	deleteExpiredSessionsJob.stop();
	syncAllBlogsJob.stop();

	const conn = Connection.getInstance();
	await conn.close();
});

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.config = config;
	event.locals.command = command;
	event.locals.query = query;

	const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
	if (sessionToken) {
		event.locals.account = await query.readAccountBySessionToken(sessionToken);
	}

	return resolve(event);
};
