import * as _ from "lodash";

import type { Blog } from "$lib/types";
import sql from "./db";

export type CreateBlogParams = {
	feedUrl: string;
	siteUrl: string;
	title: string;
	syncedAt: Date;
	etag: string | null;
	lastModified: string | null;
};

export type UpdateBlogParams = Partial<CreateBlogParams>;

export async function createBlog({
	feedUrl,
	siteUrl,
	title,
	syncedAt,
	etag,
	lastModified,
}: CreateBlogParams): Promise<Blog> {
	const created = await sql<Blog[]>`
		INSERT INTO blog
			(feed_url, site_url, title, synced_at, etag, last_modified)
		VALUES
			(${feedUrl}, ${siteUrl}, ${title}, ${syncedAt}, ${etag}, ${lastModified})
		RETURNING *
	`;
	return created[0];
}

export async function listBlogs(): Promise<Blog[]> {
	const blogs = await sql<Blog[]>`
		SELECT *
		FROM blog
	`;
	return blogs;
}

export async function readBlogById(id: string): Promise<Blog | null> {
	const blogs = await sql<Blog[]>`
		SELECT *
		FROM blog
		WHERE id = ${id}
	`;
	if (blogs.length !== 1) {
		return null;
	}
	return blogs[0];
}

export async function readBlogByFeedUrl(feedUrl: string): Promise<Blog | null> {
	const blogs = await sql<Blog[]>`
		SELECT *
		FROM blog
		WHERE feed_url = ${feedUrl}
	`;
	if (blogs.length !== 1) {
		return null;
	}
	return blogs[0];
}

export async function updateBlog(blog: Blog, params: UpdateBlogParams) {
	// clone params here because defaults mutates the dest object
	const resolved = _.defaults(_.clone(params), blog);
	await sql`
		UPDATE blog
		SET
			feed_url = ${resolved.feedUrl},
			site_url = ${resolved.siteUrl},
			title = ${resolved.title},
			synced_at = ${resolved.syncedAt},
			etag = ${resolved.etag},
			last_modified = ${resolved.lastModified}
		WHERE id = ${blog.id}
	`;
}

export async function deleteBlog(blog: Blog) {
	await sql`
		DELETE
		FROM blog
		WHERE id = ${blog.id}
	`;
}
