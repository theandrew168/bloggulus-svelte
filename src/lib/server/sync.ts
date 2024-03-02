import type { Blog } from "$lib/types";
import { defaultFeedFetcher, defaultPageFetcher, type FeedFetcher, type PageFetcher } from "./fetch";
import { parseFeed, type FeedPost, hydrateFeed } from "./feed";
import type { Storage } from "./storage/storage";

/**
 * Service for syncing blogs and posts. Depends on a FetchFeedFunction to
 * get blog data from the outside world.
 */
export class SyncService {
	private storage: Storage;
	private feedFetcher: FeedFetcher;
	private pageFetcher: PageFetcher;

	constructor(
		storage: Storage,
		feedFetcher: FeedFetcher = defaultFeedFetcher,
		pageFetcher: PageFetcher = defaultPageFetcher,
	) {
		this.storage = storage;
		this.feedFetcher = feedFetcher;
		this.pageFetcher = pageFetcher;
	}

	/**
	 * Start with the current time and a list of all known blogs. For each blog,
	 * compare its syncedAt time to the current time. If the difference is an hour
	 * or larger, sync the blog. Otherwise, skip syncing it.
	 */
	async syncAllBlogs() {
		const now = new Date();

		const blogs = await this.storage.blog.list();
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

		let blog = await this.storage.blog.readByFeedUrl(feedUrl);
		if (!blog) {
			await this.syncNewBlog(feedUrl);
		} else {
			await this.syncExistingBlog(blog);
		}
	}

	private async syncNewBlog(url: string) {
		const { feed, etag, lastModified } = await this.feedFetcher.fetchFeed(url);
		if (!feed) {
			console.log("no content: ", url);
			return;
		}

		const rawFeedBlog = await parseFeed(url, feed);
		const feedBlog = await hydrateFeed(rawFeedBlog, this.pageFetcher);
		const blog = await this.storage.blog.create({
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
		const { feed, etag, lastModified } = await this.feedFetcher.fetchFeed(
			blog.feedUrl,
			blog.etag ?? undefined,
			blog.lastModified ?? undefined,
		);

		await this.storage.blog.update(blog, {
			syncedAt: new Date(),
			etag: etag ?? blog.etag,
			lastModified: lastModified ?? blog.lastModified,
		});

		if (!feed) {
			console.log("no content: ", blog.feedUrl);
			return;
		}

		const rawFeedBlog = await parseFeed(blog.feedUrl, feed);
		const feedBlog = await hydrateFeed(rawFeedBlog, this.pageFetcher);
		for (const feedPost of feedBlog.posts) {
			await this.syncPost(blog, feedPost);
		}
	}

	private async syncPost(blog: Blog, feedPost: FeedPost) {
		const post = await this.storage.post.readByUrl(feedPost.url);
		if (!post) {
			await this.storage.post.create({
				url: feedPost.url,
				title: feedPost.title,
				updatedAt: feedPost.updatedAt,
				body: feedPost.body ?? null,
				blogId: blog.id,
			});
		} else if (post.body === null && feedPost.body) {
			await this.storage.post.update(post, {
				body: feedPost.body,
			});
		}
	}
}
