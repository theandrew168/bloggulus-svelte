import type { Blog } from "$lib/types";
import sql from "./db";

export type CreateBlogParams = {
	feedUrl: string;
	siteUrl: string;
	title: string;
	etag: string | null;
	lastModified: string | null;
};

export async function createBlog({ feedUrl, siteUrl, title, etag, lastModified }: CreateBlogParams): Promise<Blog> {
	const created = await sql<Blog[]>`
		INSERT INTO blog
			(feed_url, site_url, title, etag, last_modified)
		VALUES
			(${feedUrl}, ${siteUrl}, ${title}, ${etag}, ${lastModified})
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

/**
 * TODO: Make this API better / more universal (update anything given an ID)
 */
export async function updateBlog(id: string, etag: string | null, lastModified: string | null) {
	if (etag) {
		await sql`
			UPDATE blog
			SET etag = ${etag}
			WHERE id = ${id}
		`;
	}
	if (lastModified) {
		await sql`
			UPDATE blog
			SET last_modified = ${lastModified}
			WHERE id = ${id}
		`;
	}
}

/**
 * TODO: Make this API better / more universal (update anything given an ID)
 */
export async function updateBlogSyncedAt(id: string, syncedAt: Date) {
	await sql`
		UPDATE blog
		SET synced_at = ${syncedAt}
		WHERE id = ${id}
	`;
}
