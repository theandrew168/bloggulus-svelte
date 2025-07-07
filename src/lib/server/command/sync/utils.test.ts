import Chance from "chance";
import { describe, expect, it } from "vitest";

import { Blog } from "$lib/server/blog";
import type { FetchFeedResponse } from "$lib/server/feed/fetch";
import type { FeedPost } from "$lib/server/feed/parse";
import { Post } from "$lib/server/post";
import { newBlog, newPost } from "$lib/server/test";

import { comparePosts, updateCacheHeaders } from "./utils";

describe("command/sync/utils", () => {
	const chance = new Chance();

	describe("updateCacheHeaders", () => {
		it("should set etag and lastModified if the blog does not have them", () => {
			const etag = chance.string({ length: 10 });
			const lastModified = chance.date().toISOString();

			const blog = newBlog();

			const response: FetchFeedResponse = {
				feed: "<feed>Test Feed</feed>",
				etag,
				lastModified,
			};

			const haveHeadersChanged = updateCacheHeaders(blog, response);
			expect(haveHeadersChanged).toEqual(true);

			expect(blog.etag).toEqual(etag);
			expect(blog.lastModified).toEqual(lastModified);
		});

		it("should not change etag and lastModified if they are the same", () => {
			const etag = chance.string({ length: 10 });
			const lastModified = chance.date().toISOString();

			const blog = newBlog();
			blog.etag = etag;
			blog.lastModified = lastModified;

			const response: FetchFeedResponse = {
				feed: "<feed>Test Feed</feed>",
				etag,
				lastModified,
			};

			const haveHeadersChanged = updateCacheHeaders(blog, response);
			expect(haveHeadersChanged).toEqual(false);

			expect(blog.etag).toEqual(etag);
			expect(blog.lastModified).toEqual(lastModified);
		});

		it("should update etag and lastModified if they are different", () => {
			const etag = chance.string({ length: 10 });
			const lastModified = chance.date().toISOString();

			const blog = newBlog();
			blog.etag = etag;
			blog.lastModified = lastModified;

			const newEtag = chance.string({ length: 10 });
			const newLastModified = chance.date().toISOString();
			const response: FetchFeedResponse = {
				feed: "<feed>Test Feed</feed>",
				etag: newEtag,
				lastModified: newLastModified,
			};

			const haveHeadersChanged = updateCacheHeaders(blog, response);
			expect(haveHeadersChanged).toEqual(true);

			expect(blog.etag).toEqual(newEtag);
			expect(blog.lastModified).toEqual(newLastModified);
		});

		it("should not change etag and lastModified if response does not have them", () => {
			const etag = chance.string({ length: 10 });
			const lastModified = chance.date().toISOString();

			const blog = newBlog();
			blog.etag = etag;
			blog.lastModified = lastModified;

			const response: FetchFeedResponse = {
				feed: "<feed>Test Feed</feed>",
			};

			const haveHeadersChanged = updateCacheHeaders(blog, response);
			expect(haveHeadersChanged).toEqual(false);

			expect(blog.etag).toEqual(etag);
			expect(blog.lastModified).toEqual(lastModified);
		});
	});

	describe("comparePosts", () => {
		it("should return posts to create and update", () => {
			const blog = newBlog();
			const knownPost = newPost(blog);
			const knownPosts = [knownPost];

			// This post has changed.
			const knownFeedPost: FeedPost = {
				url: knownPost.url,
				title: chance.sentence({ words: 3 }),
				publishedAt: new Date(),
				content: chance.paragraph(),
			};
			// This post is new.
			const newFeedPost: FeedPost = {
				url: new URL(chance.url()),
				title: chance.sentence({ words: 3 }),
				publishedAt: new Date(),
				content: chance.paragraph(),
			};
			const feedPosts = [knownFeedPost, newFeedPost];

			const { postsToCreate, postsToUpdate } = comparePosts(blog, knownPosts, feedPosts);
			expect(postsToCreate.length).toEqual(1);
			expect(postsToUpdate.length).toEqual(1);

			const postToCreate = postsToCreate[0];
			expect(postToCreate.blogID).toEqual(blog.id);
			expect(postToCreate.url.toString()).toEqual(newFeedPost.url.toString());
			expect(postToCreate.title).toEqual(newFeedPost.title);
			expect(postToCreate.publishedAt).toEqual(newFeedPost.publishedAt);
			expect(postToCreate.content).toEqual(newFeedPost.content);

			const postToUpdate = postsToUpdate[0];
			expect(postToUpdate.blogID).toEqual(blog.id);
			expect(postToUpdate.url.toString()).toEqual(knownFeedPost.url.toString());
			expect(postToUpdate.title).toEqual(knownFeedPost.title);
			expect(postToUpdate.publishedAt).toEqual(knownFeedPost.publishedAt);
			expect(postToUpdate.content).toEqual(knownFeedPost.content);
		});

		it("should update an existing post if its title changes", () => {
			const blog = newBlog();
			const knownPost = newPost(blog);
			const knownPosts = [knownPost];

			// Only the title is different.
			const knownFeedPost: FeedPost = {
				url: knownPost.url,
				title: chance.sentence({ words: 3 }),
				publishedAt: knownPost.publishedAt,
				content: knownPost.content,
			};
			const feedPosts = [knownFeedPost];

			const { postsToCreate, postsToUpdate } = comparePosts(blog, knownPosts, feedPosts);
			expect(postsToCreate.length).toEqual(0);
			expect(postsToUpdate.length).toEqual(1);

			const postToUpdate = postsToUpdate[0];
			expect(postToUpdate.blogID).toEqual(blog.id);
			expect(postToUpdate.url.toString()).toEqual(knownFeedPost.url.toString());
			expect(postToUpdate.title).toEqual(knownFeedPost.title);
			expect(postToUpdate.publishedAt).toEqual(knownFeedPost.publishedAt);
			expect(postToUpdate.content).toEqual(knownFeedPost.content);
		});

		it("should update an existing post if its content changes", () => {
			const blog = newBlog();
			const knownPost = newPost(blog);
			const knownPosts = [knownPost];

			// Only the content is different.
			const knownFeedPost: FeedPost = {
				url: knownPost.url,
				title: knownPost.title,
				publishedAt: knownPost.publishedAt,
				content: chance.paragraph(),
			};
			const feedPosts = [knownFeedPost];

			const { postsToCreate, postsToUpdate } = comparePosts(blog, knownPosts, feedPosts);
			expect(postsToCreate.length).toEqual(0);
			expect(postsToUpdate.length).toEqual(1);

			const postToUpdate = postsToUpdate[0];
			expect(postToUpdate.blogID).toEqual(blog.id);
			expect(postToUpdate.url.toString()).toEqual(knownFeedPost.url.toString());
			expect(postToUpdate.title).toEqual(knownFeedPost.title);
			expect(postToUpdate.publishedAt).toEqual(knownFeedPost.publishedAt);
			expect(postToUpdate.content).toEqual(knownFeedPost.content);
		});

		it("should update an existing post if its publishedAt changes", () => {
			const blog = newBlog();
			const knownPost = newPost(blog);
			const knownPosts = [knownPost];

			// Only the publishedAt is different.
			const knownFeedPost: FeedPost = {
				url: knownPost.url,
				title: knownPost.title,
				publishedAt: chance.date(),
				content: knownPost.content,
			};
			const feedPosts = [knownFeedPost];

			const { postsToCreate, postsToUpdate } = comparePosts(blog, knownPosts, feedPosts);
			expect(postsToCreate.length).toEqual(0);
			expect(postsToUpdate.length).toEqual(1);

			const postToUpdate = postsToUpdate[0];
			expect(postToUpdate.blogID).toEqual(blog.id);
			expect(postToUpdate.url.toString()).toEqual(knownFeedPost.url.toString());
			expect(postToUpdate.title).toEqual(knownFeedPost.title);
			expect(postToUpdate.publishedAt).toEqual(knownFeedPost.publishedAt);
			expect(postToUpdate.content).toEqual(knownFeedPost.content);
		});

		it("should not update an existing post if nothing changes", () => {
			const blog = newBlog();
			const knownPost = newPost(blog);
			const knownPosts = [knownPost];

			const knownFeedPost: FeedPost = {
				url: knownPost.url,
				title: knownPost.title,
				publishedAt: knownPost.publishedAt,
				content: knownPost.content,
			};
			const feedPosts = [knownFeedPost];

			const { postsToCreate, postsToUpdate } = comparePosts(blog, knownPosts, feedPosts);
			expect(postsToCreate.length).toEqual(0);
			expect(postsToUpdate.length).toEqual(0);
		});
	});

	// describe("syncNewBlog", () => {});
	// describe("syncExistingBlog", () => {});
});
