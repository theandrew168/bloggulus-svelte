import type { PageServerLoad } from "./$types";

import { searchPosts } from "$lib/server/storage/post";
import { SyncService } from "$lib/server/sync";
import { fetchFeed, fetchPage } from "$lib/server/fetch";

const PAGE_SIZE = 15;

export const load: PageServerLoad = async ({ url }) => {
	const syncService = new SyncService(fetchFeed, fetchPage);
	syncService.syncAllBlogs();

	const q = url.searchParams.get("q") ?? "";
	const p = parseInt(url.searchParams.get("p") ?? "1") || 1;

	const limit = PAGE_SIZE;
	const offset = (p - 1) * limit;

	const posts = await searchPosts({ search: q, limit, offset });
	return {
		posts,
	};
};
