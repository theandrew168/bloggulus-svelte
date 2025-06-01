import { listRecentArticles, listRelevantArticles, type Article } from "$lib/server/domain/query";
import { Connection } from "$lib/server/postgres/connection";

import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 15;

async function listArticles(conn: Connection, q: string, limit: number, offset: number): Promise<Article[]> {
	if (q) {
		return listRelevantArticles(conn, q, limit, offset);
	}

	return listRecentArticles(conn, limit, offset);
}

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get("q") ?? "";
	const p = parseInt(url.searchParams.get("p") ?? "1") || 1;

	const limit = PAGE_SIZE;
	const offset = (p - 1) * limit;

	const conn = Connection.getInstance();
	const articles = await listArticles(conn, q, limit, offset);
	return { articles };
};
