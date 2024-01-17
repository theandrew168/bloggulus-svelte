import _ from "lodash";

import type { Post, PostWithBlogAndTags } from "$lib/types";
import sql from "./db";

export type CreatePostParams = {
	url: string;
	title: string;
	updatedAt: Date;
	body: string | null;
	blogId: string;
};

export type UpdatePostParams = Partial<CreatePostParams>;

export type SearchPostsParams = {
	search?: string;
	limit?: number;
	offset?: number;
};

const columns = ["id", "url", "title", "updated_at", "body", "blog_id"];

export async function createPost(params: CreatePostParams): Promise<Post> {
	const created = await sql<Post[]>`
		INSERT INTO post ${sql(params)}
		RETURNING ${sql(columns)}
	`;
	return created[0];
}

export async function listPostsByBlog(blogId: string): Promise<Post[]> {
	const posts = await sql<Post[]>`
		SELECT ${sql(columns)}
		FROM post
		WHERE blog_id = ${blogId}
		ORDER BY updated_at DESC
	`;
	return posts;
}

export async function readPostById(id: string): Promise<PostWithBlogAndTags | null> {
	const posts = await sql<PostWithBlogAndTags[]>`
		SELECT
			post.id,
			post.url,
			post.title,
			post.updated_at,
			post.body,
			blog.id AS blog_id,
			blog.site_url AS blog_url,
			blog.title AS blog_title,
			array_remove(array_agg(tag.name ORDER BY ts_rank_cd(post.content_index, to_tsquery(tag.name)) DESC), NULL) AS tags
		FROM post
		INNER JOIN blog
			ON blog.id = post.blog_id
		LEFT JOIN tag
			ON to_tsquery(tag.name) @@ post.content_index
		WHERE post.id = ${id}
		GROUP BY 1,2,3,4,5,6,7,8
	`;
	if (posts.length !== 1) {
		return null;
	}
	return posts[0];
}

export async function readPostByUrl(url: string): Promise<Post | null> {
	const posts = await sql<Post[]>`
		SELECT ${sql(columns)}
		FROM post
		WHERE url = ${url}
	`;
	if (posts.length !== 1) {
		return null;
	}
	return posts[0];
}

export async function updatePost(post: Post, params: UpdatePostParams) {
	// clone params here because defaults mutates the dest object
	const resolved = _.defaults(_.clone(params), post);
	await sql`
		UPDATE post
		SET ${sql(resolved, "url", "title", "updatedAt", "body")}
		WHERE id = ${post.id}
	`;
}

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
			post.body,
			blog.id AS blog_id,
			blog.site_url AS blog_url,
			blog.title AS blog_title,
			array_remove(array_agg(tag.name ORDER BY ts_rank_cd(post.content_index, to_tsquery(tag.name)) DESC), NULL) AS tags
		FROM post
		INNER JOIN blog
			ON blog.id = post.blog_id
		LEFT JOIN tag
			ON to_tsquery(tag.name) @@ post.content_index
		${search ? sql`WHERE post.content_index @@ websearch_to_tsquery('english',  ${search})` : sql``}
		GROUP BY 1,2,3,4,5,6,7,8
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

export async function deletePost(post: Post) {
	await sql`
		DELETE
		FROM post
		WHERE id = ${post.id}
	`;
}
