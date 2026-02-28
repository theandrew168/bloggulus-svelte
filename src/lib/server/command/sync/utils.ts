import { Blog } from "$lib/server/blog";
import { EmptyFeedError } from "$lib/server/command/errors";
import type { FeedFetcher, FetchFeedRequest, ResolvedFetchFeedResponse } from "$lib/server/feed/fetch";
import { parseFeed, type FeedPost } from "$lib/server/feed/parse";
import { Post } from "$lib/server/post";
import { Repository } from "$lib/server/repository";

const MAX_REDIRECT_COUNT = 5;

export function updateCacheHeaders(blog: Blog, response: ResolvedFetchFeedResponse): boolean {
	let haveHeadersChanged = false;

	if (response.etag && response.etag !== blog.etag) {
		blog.etag = response.etag;
		haveHeadersChanged = true;
	}

	if (response.lastModified && response.lastModified !== blog.lastModified) {
		blog.lastModified = response.lastModified;
		haveHeadersChanged = true;
	}

	return haveHeadersChanged;
}

export type ComparePostsResult = {
	postsToCreate: Post[];
	postsToUpdate: Post[];
};

/**
 * ComparePosts compares a list of known posts to a list of feed posts and returns
 * a list of posts to create and a list of posts to update.
 */
export function comparePosts(blog: Blog, knownPosts: Post[], feedPosts: FeedPost[]): ComparePostsResult {
	const knownPostsByURL = new Map<string, Post>();
	for (const post of knownPosts) {
		knownPostsByURL.set(post.url.toString(), post);
	}

	const postsToCreate: Post[] = [];
	const postsToUpdate: Post[] = [];

	for (const feedPost of feedPosts) {
		const knownPost = knownPostsByURL.get(feedPost.url.toString());
		if (!knownPost) {
			const postToCreate = new Post({
				blogID: blog.id,
				url: feedPost.url,
				title: feedPost.title,
				publishedAt: feedPost.publishedAt,
				content: feedPost.content,
			});
			postsToCreate.push(postToCreate);
		} else {
			let shouldKnownPostBeUpdated = false;

			if (feedPost.title && feedPost.title !== knownPost.title) {
				knownPost.title = feedPost.title;
				shouldKnownPostBeUpdated = true;
			}

			if (feedPost.content && feedPost.content !== knownPost.content) {
				knownPost.content = feedPost.content;
				shouldKnownPostBeUpdated = true;
			}

			if (feedPost.publishedAt && feedPost.publishedAt !== knownPost.publishedAt) {
				knownPost.publishedAt = feedPost.publishedAt;
				shouldKnownPostBeUpdated = true;
			}

			if (shouldKnownPostBeUpdated) {
				postsToUpdate.push(knownPost);
			}
		}
	}

	return {
		postsToCreate,
		postsToUpdate,
	};
}

export async function syncNewBlog(
	repo: Repository,
	feedFetcher: FeedFetcher,
	feedURL: URL,
	redirectCount: number = 0,
): Promise<void> {
	// Make an unconditional fetch for the blog's feed.
	const req: FetchFeedRequest = {
		url: feedURL,
	};
	const resp = await feedFetcher.fetchFeed(req);

	// If the feed URL redirects, attempt to sync using the new feed URL.
	if (resp.kind === "redirect") {
		if (redirectCount >= 5) {
			throw new Error(`Too many redirects while fetching feed for new blog: ${feedURL}`);
		}

		return syncNewBlog(repo, feedFetcher, new URL(resp.location), redirectCount + 1);
	}

	// No feed data from a new blog is an error.
	if (!resp.feed) {
		throw new EmptyFeedError(feedURL);
	}

	const feedBlog = await parseFeed(feedURL, resp.feed);

	const now = new Date();
	const blog = new Blog({
		feedURL: feedBlog.feedURL,
		siteURL: feedBlog.siteURL,
		title: feedBlog.title,
		etag: resp.etag,
		lastModified: resp.lastModified,
		syncedAt: now,
	});
	await repo.blog.create(blog);

	await syncPosts(repo, blog, feedBlog.posts);
}

export async function syncExistingBlog(
	repo: Repository,
	feedFetcher: FeedFetcher,
	blog: Blog,
	redirectCount: number = 0,
): Promise<void> {
	// When redirecting, allow multiple sync attempts to be made in quick succession.
	const isRedirecting = redirectCount > 0;
	if (!isRedirecting) {
		const now = new Date();
		if (!blog.canBeSynced(now)) {
			return;
		}

		// Update the blog's syncedAt time.
		blog.syncedAt = now;
		await repo.blog.update(blog);
	}

	// Make a conditional fetch for the blog's feed.
	const req: FetchFeedRequest = {
		url: blog.feedURL,
	};
	if (blog.etag) {
		req.etag = blog.etag;
	}
	if (blog.lastModified) {
		req.lastModified = blog.lastModified;
	}

	const resp = await feedFetcher.fetchFeed(req);

	// If the feed URL redirects, attempt to sync using the new feed URL.
	if (resp.kind === "redirect") {
		if (redirectCount >= MAX_REDIRECT_COUNT) {
			throw new Error(`Too many redirects while fetching feed for existing blog: ${blog.feedURL}`);
		}

		const oldURL = blog.feedURL;
		blog.feedURL = new URL(resp.location);
		await syncExistingBlog(repo, feedFetcher, blog, redirectCount + 1);

		// After successfully syncing with the resolved URL, store the update.
		console.log(`updated feed URL for blog ${blog.id} (${blog.title}): ${oldURL} -> ${blog.feedURL}`);
		await repo.blog.update(blog);

		return;
	}

	const haveHeadersChanged = updateCacheHeaders(blog, resp);
	if (haveHeadersChanged) {
		await repo.blog.update(blog);
	}

	// No feed data from an existing blog can occur if the feed has not changed.
	if (!resp.feed) {
		console.log(`skipping blog (no feed content): ${blog.id} (${blog.title})`);
		return;
	}

	const feedBlog = await parseFeed(blog.feedURL, resp.feed);
	await syncPosts(repo, blog, feedBlog.posts);
}

export async function syncPosts(repo: Repository, blog: Blog, feedPosts: FeedPost[]): Promise<void> {
	const knownPosts = await repo.post.listByBlogID(blog.id);
	const { postsToCreate, postsToUpdate } = comparePosts(blog, knownPosts, feedPosts);

	await Promise.all(postsToCreate.map((post) => repo.post.create(post)));
	await Promise.all(postsToUpdate.map((post) => repo.post.update(post)));
}
