import Chance from "chance";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Blog } from "$lib/server/blog";
import { EmptyFeedError } from "$lib/server/command/errors";
import { FeedFetcher, type ResolvedFetchFeedResponse } from "$lib/server/feed/fetch";
import type { FeedBlog, FeedPost } from "$lib/server/feed/parse";
import { Post } from "$lib/server/post";
import { Repository } from "$lib/server/repository";
import { generateAtomFeed, randomBlogParams, randomPostParams } from "$lib/server/test";

import { comparePosts, syncExistingBlog, syncNewBlog, updateCacheHeaders } from "./utils";

describe("command/sync/utils", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();

	describe("updateCacheHeaders", () => {
		it("should set etag and lastModified if the blog does not have them", () => {
			const etag = chance.string({ length: 10 });
			const lastModified = chance.date().toISOString();

			const blog = new Blog(randomBlogParams());

			const response: ResolvedFetchFeedResponse = {
				kind: "resolved",
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

			const blog = new Blog({
				...randomBlogParams(),
				etag,
				lastModified,
			});

			const response: ResolvedFetchFeedResponse = {
				kind: "resolved",
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

			const blog = new Blog({
				...randomBlogParams(),
				etag,
				lastModified,
			});

			const newEtag = chance.string({ length: 10 });
			const newLastModified = chance.date().toISOString();
			const response: ResolvedFetchFeedResponse = {
				kind: "resolved",
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

			const blog = new Blog({
				...randomBlogParams(),
				etag,
				lastModified,
			});

			const response: ResolvedFetchFeedResponse = {
				kind: "resolved",
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
			const blog = new Blog(randomBlogParams());
			const knownPost = new Post(randomPostParams(blog));
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
			expect(postToCreate?.blogID).toEqual(blog.id);
			expect(postToCreate?.url.toString()).toEqual(newFeedPost.url.toString());
			expect(postToCreate?.title).toEqual(newFeedPost.title);
			expect(postToCreate?.publishedAt).toEqual(newFeedPost.publishedAt);
			expect(postToCreate?.content).toEqual(newFeedPost.content);

			const postToUpdate = postsToUpdate[0];
			expect(postToUpdate?.blogID).toEqual(blog.id);
			expect(postToUpdate?.url.toString()).toEqual(knownFeedPost.url.toString());
			expect(postToUpdate?.title).toEqual(knownFeedPost.title);
			expect(postToUpdate?.publishedAt).toEqual(knownFeedPost.publishedAt);
			expect(postToUpdate?.content).toEqual(knownFeedPost.content);
		});

		it("should update an existing post if its title changes", () => {
			const blog = new Blog(randomBlogParams());
			const knownPost = new Post(randomPostParams(blog));
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
			expect(postToUpdate?.blogID).toEqual(blog.id);
			expect(postToUpdate?.url.toString()).toEqual(knownFeedPost.url.toString());
			expect(postToUpdate?.title).toEqual(knownFeedPost.title);
			expect(postToUpdate?.publishedAt).toEqual(knownFeedPost.publishedAt);
			expect(postToUpdate?.content).toEqual(knownFeedPost.content);
		});

		it("should update an existing post if its content changes", () => {
			const blog = new Blog(randomBlogParams());
			const knownPost = new Post(randomPostParams(blog));
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
			expect(postToUpdate?.blogID).toEqual(blog.id);
			expect(postToUpdate?.url.toString()).toEqual(knownFeedPost.url.toString());
			expect(postToUpdate?.title).toEqual(knownFeedPost.title);
			expect(postToUpdate?.publishedAt).toEqual(knownFeedPost.publishedAt);
			expect(postToUpdate?.content).toEqual(knownFeedPost.content);
		});

		it("should update an existing post if its publishedAt changes", () => {
			const blog = new Blog(randomBlogParams());
			const knownPost = new Post(randomPostParams(blog));
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
			expect(postToUpdate?.blogID).toEqual(blog.id);
			expect(postToUpdate?.url.toString()).toEqual(knownFeedPost.url.toString());
			expect(postToUpdate?.title).toEqual(knownFeedPost.title);
			expect(postToUpdate?.publishedAt).toEqual(knownFeedPost.publishedAt);
			expect(postToUpdate?.content).toEqual(knownFeedPost.content);
		});

		it("should not update an existing post if nothing changes", () => {
			const blog = new Blog(randomBlogParams());
			const knownPost = new Post(randomPostParams(blog));
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

	describe("syncNewBlog", async () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should fetch the feed and create the corresponding blog and posts", async () => {
			const feedURL = new URL(chance.url());
			const postURL1 = new URL(chance.url());
			const postURL2 = new URL(chance.url());
			const feedBlog: FeedBlog = {
				feedURL,
				siteURL: new URL(chance.url()),
				title: chance.sentence(),
				posts: [
					{
						url: postURL1,
						title: chance.sentence(),
						publishedAt: new Date("2023-01-01T00:00:00Z"),
						content: chance.paragraph(),
					},
					{
						url: postURL2,
						title: chance.sentence(),
						publishedAt: new Date("2023-01-02T00:00:00Z"),
					},
				],
			};

			const feed = generateAtomFeed(feedBlog);

			const feedFetcher = new FeedFetcher();
			const fetchFeedSpy = vi.spyOn(feedFetcher, "fetchFeed").mockImplementation(async () => {
				return {
					kind: "resolved",
					feed,
				};
			});

			await syncNewBlog(repo, feedFetcher, feedURL);
			expect(fetchFeedSpy).toHaveBeenCalledWith({ url: feedURL });

			const createdBlog = await repo.blog.readByFeedURL(feedURL);
			expect(createdBlog).toBeDefined();
			expect(createdBlog?.feedURL.toString()).toEqual(feedURL.toString());
			expect(createdBlog?.siteURL.toString()).toEqual(feedBlog.siteURL.toString());
			expect(createdBlog?.title).toEqual(feedBlog.title);

			const createdPosts = await repo.post.listByBlogID(createdBlog!.id);
			expect(createdPosts).toHaveLength(2);

			const createdPostURLs = createdPosts.map((post) => post.url.toString());
			expect(createdPostURLs).toContain(postURL1.toString());
			expect(createdPostURLs).toContain(postURL2.toString());
		});

		it("should throw an error if the feed is empty", async () => {
			const feedURL = new URL(chance.url());

			const feedFetcher = new FeedFetcher();
			const fetchFeedSpy = vi.spyOn(feedFetcher, "fetchFeed").mockImplementation(async () => {
				return {
					kind: "resolved",
					feed: "",
				};
			});

			await expect(syncNewBlog(repo, feedFetcher, feedURL)).rejects.toThrow(EmptyFeedError);
			expect(fetchFeedSpy).toHaveBeenCalledWith({ url: feedURL });

			const createdBlog = await repo.blog.readByFeedURL(feedURL);
			expect(createdBlog).toBeUndefined();
		});

		it("should follow redirects and update the blog's feedURL", async () => {
			const redirectFeedURL = new URL(chance.url());
			const resolvedFeedURL = new URL(chance.url());

			const feedBlog: FeedBlog = {
				feedURL: resolvedFeedURL,
				siteURL: new URL(chance.url()),
				title: chance.sentence(),
				posts: [],
			};

			const feed = generateAtomFeed(feedBlog);

			const feedFetcher = new FeedFetcher();
			const fetchFeedSpy = vi.spyOn(feedFetcher, "fetchFeed").mockImplementation(async (req) => {
				if (req.url.toString() === redirectFeedURL.toString()) {
					return {
						kind: "redirect",
						location: resolvedFeedURL.toString(),
					};
				} else if (req.url.toString() === resolvedFeedURL.toString()) {
					return {
						kind: "resolved",
						feed,
					};
				} else {
					throw new Error(`Unexpected URL in fetchFeed mock: ${req.url}`);
				}
			});

			await syncNewBlog(repo, feedFetcher, redirectFeedURL);
			expect(fetchFeedSpy).toHaveBeenCalledWith({ url: redirectFeedURL });
			expect(fetchFeedSpy).toHaveBeenCalledWith({ url: resolvedFeedURL });

			const createdBlog = await repo.blog.readByFeedURL(resolvedFeedURL);
			expect(createdBlog).toBeDefined();
			expect(createdBlog?.feedURL.toString()).toEqual(resolvedFeedURL.toString());
		});
	});

	describe("syncExistingBlog", () => {
		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("should not sync if the blog cannot be synced", async () => {
			const blog = new Blog({
				...randomBlogParams(),
				syncedAt: new Date(),
			});

			const feedFetcher = new FeedFetcher();
			const fetchFeedSpy = vi.spyOn(feedFetcher, "fetchFeed");

			await syncExistingBlog(repo, feedFetcher, blog);
			expect(fetchFeedSpy).not.toHaveBeenCalled();
		});

		it("should fetch the feed and update the blog and posts", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const post = new Post(randomPostParams(blog));
			await repo.post.create(post);

			const newPostURL = new URL(chance.url());
			const feedBlog: FeedBlog = {
				feedURL: blog.feedURL,
				siteURL: blog.siteURL,
				title: blog.title,
				posts: [
					{
						url: post.url,
						title: post.title,
						publishedAt: post.publishedAt,
						content: post.content,
					},
					{
						url: newPostURL,
						title: chance.sentence(),
						publishedAt: new Date("2023-01-01T00:00:00Z"),
						content: chance.paragraph(),
					},
				],
			};

			const feed = generateAtomFeed(feedBlog);

			const feedFetcher = new FeedFetcher();
			const fetchFeedSpy = vi.spyOn(feedFetcher, "fetchFeed").mockImplementation(async () => {
				return {
					kind: "resolved",
					feed,
				};
			});

			await syncExistingBlog(repo, feedFetcher, blog);
			expect(fetchFeedSpy).toHaveBeenCalledWith({ url: blog.feedURL });

			const updatedBlog = await repo.blog.readByFeedURL(blog.feedURL);
			expect(updatedBlog).toBeDefined();

			const updatedPosts = await repo.post.listByBlogID(updatedBlog!.id);
			expect(updatedPosts).toHaveLength(2);

			const updatedPostURLs = updatedPosts.map((p) => p.url.toString());
			expect(updatedPostURLs).toContain(post.url.toString());
			expect(updatedPostURLs).toContain(newPostURL.toString());
		});

		it("should include etag and lastModified headers when fetching the feed", async () => {
			const blog = new Blog({
				...randomBlogParams(),
				etag: chance.string({ length: 10 }),
				lastModified: chance.date().toISOString(),
			});
			await repo.blog.create(blog);

			const feedBlog: FeedBlog = {
				feedURL: blog.feedURL,
				siteURL: blog.siteURL,
				title: blog.title,
				posts: [],
			};

			const feed = generateAtomFeed(feedBlog);

			const feedFetcher = new FeedFetcher();
			const fetchFeedSpy = vi.spyOn(feedFetcher, "fetchFeed").mockImplementation(async () => {
				return {
					kind: "resolved",
					feed,
				};
			});

			await syncExistingBlog(repo, feedFetcher, blog);
			expect(fetchFeedSpy).toHaveBeenCalledWith({
				url: blog.feedURL,
				etag: blog.etag,
				lastModified: blog.lastModified,
			});
		});

		it("should update the blog's etag and lastModified if they change", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const feedBlog: FeedBlog = {
				feedURL: blog.feedURL,
				siteURL: blog.siteURL,
				title: blog.title,
				posts: [],
			};

			const feed = generateAtomFeed(feedBlog);

			const etag = chance.string({ length: 10 });
			const lastModified = chance.date().toISOString();

			const feedFetcher = new FeedFetcher();
			const fetchFeedSpy = vi.spyOn(feedFetcher, "fetchFeed").mockImplementation(async () => {
				return {
					kind: "resolved",
					feed,
					etag,
					lastModified,
				};
			});

			await syncExistingBlog(repo, feedFetcher, blog);
			expect(fetchFeedSpy).toHaveBeenCalled();

			const updatedBlog = await repo.blog.readByFeedURL(blog.feedURL);
			expect(updatedBlog).toBeDefined();
			expect(updatedBlog?.etag).toEqual(etag);
			expect(updatedBlog?.lastModified).toEqual(lastModified);
		});

		it("should follow redirects and update the blog's feedURL", async () => {
			const redirectFeedURL = new URL(chance.url());
			const blog = new Blog({
				...randomBlogParams(),
				feedURL: redirectFeedURL,
			});
			await repo.blog.create(blog);

			const resolvedFeedURL = new URL(chance.url());

			const feedBlog: FeedBlog = {
				feedURL: resolvedFeedURL,
				siteURL: new URL(chance.url()),
				title: chance.sentence(),
				posts: [],
			};

			const feed = generateAtomFeed(feedBlog);

			const feedFetcher = new FeedFetcher();
			const fetchFeedSpy = vi.spyOn(feedFetcher, "fetchFeed").mockImplementation(async (req) => {
				if (req.url.toString() === redirectFeedURL.toString()) {
					return {
						kind: "redirect",
						location: resolvedFeedURL.toString(),
					};
				} else if (req.url.toString() === resolvedFeedURL.toString()) {
					return {
						kind: "resolved",
						feed,
					};
				} else {
					throw new Error(`Unexpected URL in fetchFeed mock: ${req.url}`);
				}
			});

			await syncExistingBlog(repo, feedFetcher, blog);
			expect(fetchFeedSpy).toHaveBeenCalledWith({ url: redirectFeedURL });
			expect(fetchFeedSpy).toHaveBeenCalledWith({ url: resolvedFeedURL });

			const updatedBlog = await repo.blog.readByID(blog.id);
			expect(updatedBlog).toBeDefined();
			expect(updatedBlog?.feedURL.toString()).toEqual(resolvedFeedURL.toString());
		});
	});
});
