import type { LoadEvent } from "@sveltejs/kit";

import { searchPosts } from "$lib/server/storage/post";

const PAGE_SIZE = 15;

export async function load({ url }: LoadEvent) {
	const q = url.searchParams.get("q") ?? "";
	const p = parseInt(url.searchParams.get("p") ?? "1") || 1;

	const limit = PAGE_SIZE;
	const offset = (p - 1) * limit;

	const posts = await searchPosts({ search: q, limit, offset });
	return {
		posts,
	};
}
