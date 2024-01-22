import Parser from "rss-parser";
import he from "he";

import { createBlog, listBlogs, readBlogByFeedUrl, updateBlog } from "./storage/blog";
import { createPost, readPostByUrl, updatePost } from "./storage/post";

export function sanitize(html: string): string {
	const exprs = [/<head>.*?<\/head>/gs, /<nav>.*?<\/nav>/gs, /<code>.*?<\/code>/gs, /<pre>.*?<\/pre>/gs, /<[^>]*>/gs];

	let text = html;
	exprs.forEach((expr) => (text = text.replace(expr, "")));

	text = he.decode(text);
	text = text.replace(/\s+/gs, " ");
	text = text.trim();
	return text;
}

export async function fetchBody(url: string): Promise<string | null> {
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

/**
 * Start with the URL for a given RSS/Atom feed (this URL uniquely identifies
 * a blog). Check the database to see if we already know about this blog.
 * If we do AND we have an existing etag / lastModified, add them to a headers
 * object. Make a fetch request using the URL and headers to get a test response
 * from the feed's server. Check for ETag/Last-Modified headers and update the DB
 * if the blog does already exist.
 *
 * If the server response with a 3xx status, then there are no new changes since
 * we last checked. The flow stops here.
 *
 * Otherwise, parse the response as an RSS/Atom feed. Grab the blog's base URL
 * and title from the feed. Create the blog if it doesn't already exist.
 *
 * For each post, grab its metadata from the feed. If the content is provided
 * via the feed, use that for body indexing. Otherwise, fetch the page directly
 * and strip the HTML tags out (via the sanitize helper). Check if we already
 * know about this post (via its URL). If we do but don't have a body stored,
 * update the post to include the body. Otherwise, create a new post.
 */
export async function syncBlog(feedUrl: string) {
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

	const syncedAt = new Date();

	const etag = resp.headers.get("ETag");
	const lastModified = resp.headers.get("Last-Modified");

	if (blog) {
		await updateBlog(blog, { syncedAt, etag, lastModified });
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
		blog = await createBlog({ feedUrl, siteUrl, title, syncedAt, etag, lastModified });
	}

	for (const item of feed.items) {
		const url = item.link ?? "";
		const title = item.title ?? "";
		const updatedAt = item.pubDate ? new Date(item.pubDate) : new Date();
		const body = item.contentSnippet ?? (await fetchBody(url));

		const post = await readPostByUrl(url);
		if (!post) {
			await createPost({ url, title, updatedAt, body, blogId: blog.id });
		} else if (post.body === null) {
			await updatePost(post, { body });
		}
	}
}

/**
 * Start with the current time and a list of all known blogs. For each blog,
 * compare its syncedAt time to the current time. If the difference is an hour
 * or larger, sync the blog. Otherwise, skip syncing it.
 */
export async function syncAllBlogs() {
	const now = new Date();

	const blogs = await listBlogs();
	for (const blog of blogs) {
		const delta = (now.getTime() - blog.syncedAt.getTime()) / 1000;
		if (delta < 3600) {
			console.log("recently synced: ", blog.title);
			continue;
		}

		await syncBlog(blog.feedUrl);
	}
}
