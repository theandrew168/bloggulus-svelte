import { PostgresWebQuery } from "$lib/server/query/postgres/web";
import type { WebQuery } from "$lib/server/query/web";
import type { Article } from "$lib/types";

import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 15;

async function listArticles(query: WebQuery, q: string, limit: number, offset: number): Promise<Article[]> {
	if (q) {
		return query.listRelevantArticles(q, limit, offset);
	}

	return query.listRecentArticles(limit, offset);
}

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get("q") ?? "";
	const p = parseInt(url.searchParams.get("p") ?? "1") || 1;

	const limit = PAGE_SIZE;
	const offset = (p - 1) * limit;

	// TODO: Should the WebQuery be injected (by a server hook or something?).
	const query = PostgresWebQuery.getInstance();
	const articles = await listArticles(query, q, limit, offset);
	return { articles };
};
