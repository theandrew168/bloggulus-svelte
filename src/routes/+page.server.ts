import type { PageServerLoad } from "./$types";

import { SyncService } from "$lib/server/sync";

const PAGE_SIZE = 15;

export const load: PageServerLoad = async ({ url, locals }) => {
	const syncService = new SyncService(locals.storage);
	syncService.syncAllBlogs();

	const q = url.searchParams.get("q") ?? "";
	const p = parseInt(url.searchParams.get("p") ?? "1") || 1;

	const limit = PAGE_SIZE;
	const offset = (p - 1) * limit;

	const posts = await locals.storage.post.search({ search: q, limit, offset });
	return {
		posts,
	};
};
