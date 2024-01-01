import type { Post, PostWithBlogAndTags } from "$lib/types";
import sql from "./db";

export type CreatePostParams = {
	url: string;
	title: string;
	updatedAt: Date;
	body: string | null;
	blogId: string;
};

export async function createPost({ url, title, updatedAt, body, blogId }: CreatePostParams): Promise<Post> {
	const created = await sql<Post[]>`
		INSERT INTO post
			(url, title, updated_at, body, blog_id)
		VALUES
			(${url}, ${title}, ${updatedAt}, ${body}, ${blogId})
		RETURNING *
	`;
	return created[0];
}

export async function readPostByUrl(url: string): Promise<Post | null> {
	const posts = await sql<Post[]>`
		SELECT *
		FROM post
		WHERE url = ${url}
	`;
	if (posts.length !== 1) {
		return null;
	}
	return posts[0];
}

export async function updatePost(id: string, body: string | null) {
	await sql`
		UPDATE post
		SET body = ${body}
		WHERE id = ${id}
	`;
}

export type SearchPostsParams = {
	search?: string;
	limit?: number;
	offset?: number;
};

export async function searchPosts({
	search,
	limit = 15,
	offset = 0,
}: SearchPostsParams): Promise<PostWithBlogAndTags[]> {
	const posts = await sql<PostWithBlogAndTags[]>`
		SELECT
			post.id,
			post.url,
			post.title,
			post.updated_at,
			blog.site_url AS blog_url,
			blog.title AS blog_title,
			array_remove(array_agg(tag.name ORDER BY ts_rank_cd(post.content_index, to_tsquery(tag.name)) DESC), NULL) AS tags
		FROM post
		INNER JOIN blog
			ON blog.id = post.blog_id
		LEFT JOIN tag
			ON to_tsquery(tag.name) @@ post.content_index
		${search ? sql`WHERE post.content_index @@ websearch_to_tsquery('english',  ${search})` : sql``}
		GROUP BY 1,2,3,4,5,6
		ORDER BY ${
			search
				? sql`ts_rank_cd(post.content_index, websearch_to_tsquery('english',  ${search})) DESC`
				: sql`post.updated_at DESC`
		}
		LIMIT ${limit}
		OFFSET ${offset}
	`;
	return posts;
}
