import type { LoadEvent } from "@sveltejs/kit";

import sql from "$lib/server/db";
import type { Post } from "$lib/types";

const PAGE_SIZE = 15;

type PostWithBlog = Post & { blogUrl: string; blogTitle: string };

export async function load({ url }: LoadEvent) {
	const q = url.searchParams.get("q") ?? "";
	const p = parseInt(url.searchParams.get("p") ?? "1") || 1;

	const limit = PAGE_SIZE;
	const offset = (p - 1) * limit;

	const posts = await sql<PostWithBlog[]>`
		SELECT
			post.id,
			post.url,
			post.title,
			post.updated_at,
			blog.site_url AS blog_url,
			blog.title AS blog_title
		FROM post
		INNER JOIN blog
			ON blog.id = post.blog_id
		${q ? sql`WHERE post.content_index @@ websearch_to_tsquery('english',  ${q})` : sql``}
		ORDER BY ${q ? sql`ts_rank_cd(post.content_index, websearch_to_tsquery('english',  ${q}))` : sql`post.updated_at DESC`}
		LIMIT ${limit}
		OFFSET ${offset}
	`;

	return {
		posts,
	};
}
