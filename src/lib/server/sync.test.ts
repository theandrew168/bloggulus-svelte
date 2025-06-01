import { describe, expect, test } from "vitest";

import type { FeedBlog, FeedPost } from "./feed";
import { BLOG_FOOBAR, mockAtomFeed, MockFeedFetcher, MockPageFetcher, POST_BAR, POST_FOO } from "./mock";
import { RollbackError } from "./storage/errors";
import { connect } from "./storage/storage";
import { SyncService } from "./sync";

describe("SyncService", () => {
	const storage = connect();

	test("new blogs can be added", async () => {
		await storage.transaction(async (storage) => {
			const atomFeed = mockAtomFeed(BLOG_FOOBAR);
			const feedFetcher = new MockFeedFetcher({ feed: atomFeed });
			const pageFetcher = new MockPageFetcher({});

			const syncService = new SyncService(storage, feedFetcher, pageFetcher);
			await syncService.syncBlog(BLOG_FOOBAR.feedUrl);

			const blog = await storage.blog.readByFeedUrl(BLOG_FOOBAR.feedUrl);
			expect(blog).to.not.be.undefined;

			const posts = await storage.post.listByBlog(blog!.id);
			expect(posts.length).to.equal(BLOG_FOOBAR.posts.length);

			throw new RollbackError();
		});
	});

	test("new posts will be added as they appear", async () => {
		await storage.transaction(async (storage) => {
			const mockBlog: FeedBlog = {
				...BLOG_FOOBAR,
				posts: [POST_FOO, POST_BAR],
			};
			const atomFeed = mockAtomFeed(mockBlog);
			let feedFetcher = new MockFeedFetcher({ feed: atomFeed });
			const pageFetcher = new MockPageFetcher({});

			let syncService = new SyncService(storage, feedFetcher, pageFetcher);
			await syncService.syncBlog(mockBlog.feedUrl);

			let blog = await storage.blog.readByFeedUrl(mockBlog.feedUrl);
			expect(blog).to.not.be.undefined;

			let posts = await storage.post.listByBlog(blog!.id);
			expect(posts.length).to.equal(mockBlog.posts.length);

			const postBaz: FeedPost = {
				title: "Baz",
				url: "https://example.com/baz",
				updatedAt: new Date(),
			};
			mockBlog.posts.push(postBaz);

			const updatedAtomFeed = mockAtomFeed(mockBlog);
			feedFetcher = new MockFeedFetcher({ feed: updatedAtomFeed });
			syncService = new SyncService(storage, feedFetcher, pageFetcher);
			await syncService.syncBlog(mockBlog.feedUrl);

			blog = await storage.blog.readByFeedUrl(mockBlog.feedUrl);
			expect(blog).to.not.be.undefined;

			posts = await storage.post.listByBlog(blog!.id);
			expect(posts.length).to.equal(mockBlog.posts.length);

			throw new RollbackError();
		});
	});

	test("will skip feeds with no content", async () => {
		const feedFetcher = new MockFeedFetcher({});
		const pageFetcher = new MockPageFetcher({});

		const syncService = new SyncService(storage, feedFetcher, pageFetcher);
		await syncService.syncBlog(BLOG_FOOBAR.feedUrl);

		const blog = await storage.blog.readByFeedUrl(BLOG_FOOBAR.feedUrl);
		expect(blog).to.be.undefined;
	});

	test("will update a post if a body is eventually found", async () => {
		await storage.transaction(async (storage) => {
			const atomFeed = mockAtomFeed(BLOG_FOOBAR);
			const feedFetcher = new MockFeedFetcher({ feed: atomFeed });
			let pageFetcher = new MockPageFetcher({});

			let syncService = new SyncService(storage, feedFetcher, pageFetcher);
			await syncService.syncBlog(BLOG_FOOBAR.feedUrl);

			const postBefore = await storage.post.readByUrl(POST_BAR.url);
			expect(postBefore).to.not.be.undefined;
			expect(postBefore?.content).to.be.null;

			const page = "content about bar";
			pageFetcher = new MockPageFetcher({ page });
			syncService = new SyncService(storage, feedFetcher, pageFetcher);
			await syncService.syncBlog(BLOG_FOOBAR.feedUrl);

			const postAfter = await storage.post.readByUrl(POST_BAR.url);
			expect(postAfter).to.not.be.undefined;
			expect(postAfter?.content).to.equal(page);

			throw new RollbackError();
		});
	});

	test("skip posts without a link or title", async () => {
		await storage.transaction(async (storage) => {
			const mockBlog: FeedBlog = {
				...BLOG_FOOBAR,
				posts: [
					{
						...POST_FOO,
						title: "",
					},
					{
						...POST_BAR,
						url: "",
					},
				],
			};
			const atomFeed = mockAtomFeed(mockBlog);
			const feedFetcher = new MockFeedFetcher({ feed: atomFeed });
			const pageFetcher = new MockPageFetcher({});

			const syncService = new SyncService(storage, feedFetcher, pageFetcher);
			await syncService.syncBlog(mockBlog.feedUrl);

			const blog = await storage.blog.readByFeedUrl(mockBlog.feedUrl);
			expect(blog).to.not.be.undefined;

			const posts = await storage.post.listByBlog(blog!.id);
			expect(posts.length).to.equal(0);

			throw new RollbackError();
		});
	});

	test("cache fields do not get overwritten by empty values", async () => {
		await storage.transaction(async (storage) => {
			const etag = "some etag value";
			const lastModified = "some lastModified value";

			const atomFeed = mockAtomFeed(BLOG_FOOBAR);
			let feedFetcher = new MockFeedFetcher({ feed: atomFeed, etag, lastModified });
			const pageFetcher = new MockPageFetcher({});

			let syncService = new SyncService(storage, feedFetcher, pageFetcher);
			await syncService.syncBlog(BLOG_FOOBAR.feedUrl);

			let blog = await storage.blog.readByFeedUrl(BLOG_FOOBAR.feedUrl);
			expect(blog).to.not.be.undefined;
			expect(blog?.etag).to.equal(etag);
			expect(blog?.lastModified).to.equal(lastModified);

			feedFetcher = new MockFeedFetcher({ feed: atomFeed });
			syncService = new SyncService(storage, feedFetcher, pageFetcher);
			await syncService.syncBlog(BLOG_FOOBAR.feedUrl);

			blog = await storage.blog.readByFeedUrl(BLOG_FOOBAR.feedUrl);
			expect(blog).to.not.be.undefined;
			expect(blog?.etag).to.equal(etag);
			expect(blog?.lastModified).to.equal(lastModified);

			throw new RollbackError();
		});
	});
});
