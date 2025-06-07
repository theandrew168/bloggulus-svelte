import type { WebQuery } from "$lib/server/query/web";
import type { Article } from "$lib/types";

import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 15;

type ArticlesWithTotal = {
	articles: Article[];
	total: number;
};

async function listArticles(query: WebQuery, q: string, limit: number, offset: number): Promise<ArticlesWithTotal> {
	if (q) {
		const [total, articles] = await Promise.all([
			query.countRelevantArticles(q),
			query.listRelevantArticles(q, limit, offset),
		]);
		return { articles, total };
	}

	const [total, articles] = await Promise.all([query.countRecentArticles(), query.listRecentArticles(limit, offset)]);
	return { articles, total };
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get("q") ?? "";
	const p = parseInt(url.searchParams.get("p") ?? "1") || 1;

	const limit = PAGE_SIZE;
	const offset = (p - 1) * limit;

	const articlesWithTotal = await listArticles(locals.query, q, limit, offset);
	return articlesWithTotal;
};
