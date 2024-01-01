import Parser from "rss-parser";
import { decode } from "he";

import { createBlog, listBlogs, readBlogByFeedUrl, updateBlog, updateBlogSyncedAt } from "./storage/blog";
import { createPost, readPostByUrl, updatePost } from "./storage/post";

function sanitize(html: string): string {
	const exprs = [/<head>.*?<\/head>/gs, /<nav>.*?<\/nav>/gs, /<code>.*?<\/code>/gs, /<pre>.*?<\/pre>/gs, /<[^>]*>/gs];

	let text = html;
	exprs.forEach((expr) => (text = text.replace(expr, "")));

	text = decode(text);
	text = text.replace(/\s+/gs, " ");
	text = text.trim();
	return text;
}

async function fetchBody(url: string): Promise<string | null> {
	try {
		const resp = await fetch(url);
		const html = await resp.text();
		const body = sanitize(html);
		return body;
	} catch (e) {
		console.log(e);
		return null;
	}
}

export async function sync(feedUrl: string) {
	console.log("syncing: ", feedUrl);

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
			const body = await fetchBody(url);
			await createPost({ url, title, updatedAt, body, blogId: blog.id });
		} else if (post.body === null) {
			const body = await fetchBody(url);
			await updatePost(post.id, body);
		}
	}
}

export async function syncAll() {
	const blogs = await listBlogs();
	for (const blog of blogs) {
		const now = new Date();
		const delta = (now.getTime() - blog.syncedAt.getTime()) / 1000;
		if (delta < 3600) {
			console.log("recently synced: ", blog.title);
			continue;
		}

		await updateBlogSyncedAt(blog.id, now);
		await sync(blog.feedUrl);
	}
}
