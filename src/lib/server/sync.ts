import Parser from "rss-parser";

import { createBlog, readBlogByFeedUrl, updateBlog } from "./storage/blog";
import { createPost, readPostByUrl } from "./storage/post";

export async function sync(feedUrl: string) {
	console.log(`syncing ${feedUrl}`);

	let blog = await readBlogByFeedUrl(feedUrl);

	const headers = new Headers();
	if (blog?.etag) {
		headers.set("If-None-Match", blog.etag);
	}
	if (blog?.lastModified) {
		headers.set("If-Modified-Since", blog.lastModified);
	}
	const resp = await fetch(feedUrl, { headers });
	const text = await resp.text();

	const etag = resp.headers.get("ETag");
	const lastModified = resp.headers.get("Last-Modified");

	if (blog) {
		await updateBlog(blog.id, etag, lastModified);
	}

	if (resp.status >= 300) {
		console.log("No changes!");
		return;
	}

	const parser = new Parser();
	const feed = await parser.parseString(text);
	const siteUrl = feed.link ?? feedUrl;
	const title = feed.title ?? siteUrl;

	if (!blog) {
		blog = await createBlog({ feedUrl, siteUrl, title, etag, lastModified });
	}

	for (const item of feed.items) {
		const url = item.link ?? "";
		const title = item.title ?? "";
		const updatedAt = item.pubDate ? new Date(item.pubDate) : new Date();

		const post = await readPostByUrl(url);
		if (!post) {
			await createPost({ url, title, updatedAt, blogId: blog.id });
		}
	}
}
