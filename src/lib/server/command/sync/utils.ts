import { Blog } from "$lib/server/blog";
import type { FeedFetcher, FetchFeedRequest, FetchFeedResponse } from "$lib/server/feed";
import { parseFeed, type FeedPost } from "$lib/server/feed/parse";
import { Post } from "$lib/server/post";
import type { Repository } from "$lib/server/repository";

export function updateCacheHeaders(blog: Blog, response: FetchFeedResponse): boolean {
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

export async function syncNewBlog(repo: Repository, feedFetcher: FeedFetcher, feedURL: string): Promise<void> {
	// Make an unconditional fetch for the blog's feed.
	const req: FetchFeedRequest = {
		url: feedURL,
	};
	const resp = await feedFetcher.fetchFeed(req);

	// No feed data from a new blog is an error.
	if (!resp.feed) {
		throw new Error(`Failed to fetch feed from ${feedURL}`);
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
	await repo.blog.createOrUpdate(blog);

	await syncPosts(repo, blog, feedBlog.posts);
}

export async function syncExistingBlog(repo: Repository, feedFetcher: FeedFetcher, blog: Blog): Promise<void> {
	// Make a conditional fetch for the blog's feed.
	const req: FetchFeedRequest = {
		url: blog.feedURL,
		etag: blog.etag,
		lastModified: blog.lastModified,
	};
	const resp = await feedFetcher.fetchFeed(req);

	const haveHeadersChanged = updateCacheHeaders(blog, resp);
	if (haveHeadersChanged) {
		await repo.blog.createOrUpdate(blog);
	}

	// No feed data from an existing blog can occur if the feed has not changed.
	if (!resp.feed) {
		return;
	}

	const feedBlog = await parseFeed(blog.feedURL, resp.feed);
	await syncPosts(repo, blog, feedBlog.posts);
}

export async function syncPosts(repo: Repository, blog: Blog, feedPosts: FeedPost[]): Promise<void> {
	const knownPosts = await repo.post.listByBlogID(blog.id);
	const { postsToCreate, postsToUpdate } = comparePosts(blog, knownPosts, feedPosts);

	await Promise.all(postsToCreate.map((post) => repo.post.createOrUpdate(post)));
	await Promise.all(postsToUpdate.map((post) => repo.post.createOrUpdate(post)));
}
