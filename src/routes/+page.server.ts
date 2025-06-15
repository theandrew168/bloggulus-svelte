import type { Article } from "$lib/types";

import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 15;

type ArticlesWithTotal = {
	articles: Article[];
	total: number;
};

async function listArticles(locals: App.Locals, q: string, limit: number, offset: number): Promise<ArticlesWithTotal> {
	const { account, query } = locals;
	if (account) {
		if (q) {
			const [total, articles] = await Promise.all([
				query.countRelevantArticlesByAccount(account, q),
				query.listRelevantArticlesByAccount(account, q, limit, offset),
			]);
			return { articles, total };
		} else {
			const [total, articles] = await Promise.all([
				query.countRecentArticlesByAccount(account),
				query.listRecentArticlesByAccount(account, limit, offset),
			]);
			return { articles, total };
		}
	} else {
		if (q) {
			const [total, articles] = await Promise.all([
				query.countRelevantArticles(q),
				query.listRelevantArticles(q, limit, offset),
			]);
			return { articles, total };
		} else {
			const [total, articles] = await Promise.all([
				query.countRecentArticles(),
				query.listRecentArticles(limit, offset),
			]);
			return { articles, total };
		}
	}
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get("q") ?? "";
	const p = parseInt(url.searchParams.get("p") ?? "1") || 1;

	const limit = PAGE_SIZE;
	const offset = (p - 1) * limit;

	const articlesWithTotal = await listArticles(locals, q, limit, offset);

	const hasMore = p * limit < articlesWithTotal.total;
	const moreLink = `/?p=${p + 1}` + (q ? `&q=${q}` : "");

	return {
		...articlesWithTotal,
		...(hasMore ? { moreLink } : {}),
	};
};
