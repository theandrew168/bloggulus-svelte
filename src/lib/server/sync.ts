import type { Blog } from "$lib/types";
import { createBlog, listBlogs, readBlogByFeedUrl, updateBlog } from "./storage/blog";
import { createPost, readPostByUrl, updatePost } from "./storage/post";
import type { FetchFeedFn, FetchPageFn } from "./fetch";
import { parseFeed, type FeedPost } from "./feed";

/**
 * Service for syncing blogs and posts. Depends on a FetchFeedFunction to
 * get blog data from the outside world.
 */
export class SyncService {
	private fetchFeed: FetchFeedFn;
	private fetchPage: FetchPageFn;

	constructor(fetchFeed: FetchFeedFn, fetchPage: FetchPageFn) {
		this.fetchFeed = fetchFeed;
		this.fetchPage = fetchPage;
	}

	/**
	 * Start with the current time and a list of all known blogs. For each blog,
	 * compare its syncedAt time to the current time. If the difference is an hour
	 * or larger, sync the blog. Otherwise, skip syncing it.
	 */
	async syncAllBlogs() {
		const now = new Date();

		const blogs = await listBlogs();
		for (const blog of blogs) {
			const delta = (now.getTime() - blog.syncedAt.getTime()) / 1000;
			if (delta < 3600) {
				console.log("recently synced: ", blog.title);
				continue;
			}

			await this.syncBlog(blog.feedUrl);
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
	async syncBlog(feedUrl: string) {
		console.log("syncing:", feedUrl);

		let blog = await readBlogByFeedUrl(feedUrl);
		if (!blog) {
			await this.syncNewBlog(feedUrl);
		} else {
			await this.syncExistingBlog(blog);
		}
	}

	private async syncNewBlog(url: string) {
		const { feed, etag, lastModified } = await this.fetchFeed(url);
		if (!feed) {
			console.log("no content: ", url);
			return;
		}

		const feedBlog = await parseFeed(url, feed, this.fetchPage);
		const blog = await createBlog({
			feedUrl: feedBlog.feedUrl,
			siteUrl: feedBlog.siteUrl,
			title: feedBlog.title,
			syncedAt: new Date(),
			etag: etag ?? null,
			lastModified: lastModified ?? null,
		});

		for (const feedPost of feedBlog.posts) {
			await this.syncPost(blog, feedPost);
		}
	}

	private async syncExistingBlog(blog: Blog) {
		const { feed, etag, lastModified } = await this.fetchFeed(
			blog.feedUrl,
			blog.etag ?? undefined,
			blog.lastModified ?? undefined,
		);

		await updateBlog(blog, {
			syncedAt: new Date(),
			etag: etag ?? null,
			lastModified: lastModified ?? null,
		});

		if (!feed) {
			console.log("no content: ", blog.feedUrl);
			return;
		}

		const feedBlog = await parseFeed(blog.feedUrl, feed, this.fetchPage);
		for (const feedPost of feedBlog.posts) {
			await this.syncPost(blog, feedPost);
		}
	}

	private async syncPost(blog: Blog, feedPost: FeedPost) {
		const post = await readPostByUrl(feedPost.url);
		if (!post) {
			await createPost({
				url: feedPost.url,
				title: feedPost.title,
				updatedAt: feedPost.updatedAt,
				body: feedPost.body ?? null,
				blogId: blog.id,
			});
		} else if (post.body === null && feedPost.body) {
			await updatePost(post, {
				body: feedPost.body,
			});
		}
	}
}
