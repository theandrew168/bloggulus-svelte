import type { Blog } from "$lib/server/domain/blog";
import { Post } from "$lib/server/domain/post";
import type { FetchFeedResponse } from "$lib/server/feed/fetch";
import type { FeedPost } from "$lib/server/feed/parse";

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
