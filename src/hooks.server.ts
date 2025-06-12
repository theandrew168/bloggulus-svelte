import type { Handle } from "@sveltejs/kit";

import { EnvConfig } from "$lib/server/config/config";
import { PostgresWebQuery } from "$lib/server/query/postgres/web";
import { PostgresRepository } from "$lib/server/repository/postgres/repository";

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.config = EnvConfig.getInstance();
	event.locals.repo = PostgresRepository.getInstance();
	event.locals.query = PostgresWebQuery.getInstance();
	return resolve(event);
};
