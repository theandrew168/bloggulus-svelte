import Chance from "chance";
import { describe, expect, it } from "vitest";

import { Account } from "$lib/server/account";
import { Blog } from "$lib/server/blog";
import { Repository } from "$lib/server/repository";
import { randomAccountParams, randomBlogParams } from "$lib/server/test";

import { WebQuery } from ".";

describe("query/web/blog", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();

	const query = WebQuery.getInstance();

	describe("readDetailsByID", () => {
		it("should read post details by ID", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const blogDetails = await query.blog.readDetailsByID(blog.id);
			expect(blogDetails).toBeDefined();

			expect(blogDetails?.id).toEqual(blog.id);
			expect(blogDetails?.feedURL).toEqual(blog.feedURL.toString());
			expect(blogDetails?.siteURL).toEqual(blog.siteURL.toString());
			expect(blogDetails?.title).toEqual(blog.title);
			expect(blogDetails?.syncedAt).toEqual(blog.syncedAt);
		});

		it("should return undefined for invalid blog IDs", async () => {
			const invalidBlogID = crypto.randomUUID();

			const blogDetails = await query.blog.readDetailsByID(invalidBlogID);
			expect(blogDetails).toBeUndefined();
		});
	});

	describe("readDetailsByFeedURL", () => {
		it("should read blog details by feed URL", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const blogDetails = await query.blog.readDetailsByFeedURL(blog.feedURL.toString());
			expect(blogDetails).toBeDefined();

			expect(blogDetails?.id).toEqual(blog.id);
			expect(blogDetails?.feedURL).toEqual(blog.feedURL.toString());
			expect(blogDetails?.siteURL).toEqual(blog.siteURL.toString());
			expect(blogDetails?.title).toEqual(blog.title);
			expect(blogDetails?.syncedAt).toEqual(blog.syncedAt);
		});

		it("should return undefined for invalid feed URLs", async () => {
			const invalidBlogFeedURL = chance.url();

			const blogDetails = await query.blog.readDetailsByFeedURL(invalidBlogFeedURL);
			expect(blogDetails).toBeUndefined();
		});
	});

	describe("list", () => {
		it("should list all blogs", async () => {
			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			const blog1 = new Blog(randomBlogParams());
			await repo.blog.create(blog1);

			const blog2 = new Blog(randomBlogParams());
			await repo.blog.create(blog2);

			// Follow one of the blogs.
			account.followBlog(blog1.id);
			await repo.account.update(account);

			const blogs = await query.blog.list(account);

			const listedBlog1 = blogs.find((blog) => blog.id === blog1.id);
			expect(listedBlog1).toBeDefined();
			expect(listedBlog1?.isFollowed).toEqual(true);

			const listedBlog2 = blogs.find((blog) => blog.id === blog2.id);
			expect(listedBlog2).toBeDefined();
			expect(listedBlog2?.isFollowed).toEqual(false);
		});
	});
});
