import Parser from "rss-parser";
import sql from "./db";
import type { Blog, Post } from "$lib/types";

export async function sync(feedURL: string) {
	console.log(`syncing ${feedURL}`);

	const blogs = await sql<Blog[]>`
		SELECT *
		FROM blog
		WHERE feed_url = ${feedURL}
	`;
	let blog = blogs[0];

	const headers = new Headers();
	if (blog?.etag) {
		headers.set("If-None-Match", blog.etag);
	}
	if (blog?.lastModified) {
		headers.set("If-Modified-Since", blog.lastModified);
	}
	const resp = await fetch(feedURL, { headers });
	const text = await resp.text();

	const etag = resp.headers.get("ETag");
	const lastModified = resp.headers.get("Last-Modified");

	if (blog) {
		if (etag) {
			await sql`
				UPDATE blog
				SET etag = ${etag}
				WHERE feed_url = ${feedURL}
			`;
		}
		if (lastModified) {
			await sql`
				UPDATE blog
				SET last_modified = ${lastModified}
				WHERE feed_url = ${feedURL}
			`;
		}
	}

	if (resp.status >= 300) {
		console.log("No changes!");
		return;
	}

	const parser = new Parser();
	const feed = await parser.parseString(text);
	const siteURL = feed.link ?? feedURL;
	const title = feed.title ?? siteURL;

	if (!blog) {
		const created = await sql<Blog[]>`
			INSERT INTO blog
				(feed_url, site_url, title, etag, last_modified)
			VALUES
				(${feedURL}, ${siteURL}, ${title}, ${etag}, ${lastModified})
			RETURNING *
		`;
		blog = created[0];
	}

	for (const item of feed.items) {
		const url = item.link ?? "";
		const title = item.title ?? "";
		const updatedAt = item.pubDate ? new Date(item.pubDate) : new Date();

		const posts = await sql<Post[]>`
			SELECT *
			FROM post
			WHERE url = ${url}
		`;
		let post = posts[0];
		if (!post) {
			await sql`
				INSERT INTO post
					(url, title, updated_at, blog_id)
				VALUES
					(${url}, ${title}, ${updatedAt}, ${blog.id})
			`;
		}
	}
}
