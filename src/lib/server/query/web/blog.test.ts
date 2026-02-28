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
			expect(blogDetails?.feedURL).toEqual(blog.feedURL);
			expect(blogDetails?.siteURL).toEqual(blog.siteURL);
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
			expect(blogDetails?.feedURL).toEqual(blog.feedURL);
			expect(blogDetails?.siteURL).toEqual(blog.siteURL);
			expect(blogDetails?.title).toEqual(blog.title);
			expect(blogDetails?.syncedAt).toEqual(blog.syncedAt);
		});

		it("should return undefined for invalid feed URLs", async () => {
			const invalidBlogFeedURL = chance.url();

			const blogDetails = await query.blog.readDetailsByFeedURL(invalidBlogFeedURL);
			expect(blogDetails).toBeUndefined();
		});
	});

	describe("listAll", () => {
		it("should list all blogs", async () => {
			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			// public, not followed
			const blog1 = new Blog(randomBlogParams());
			blog1.isPublic = true;
			await repo.blog.create(blog1);

			// private, not followed
			const blog2 = new Blog(randomBlogParams());
			blog2.isPublic = false;
			await repo.blog.create(blog2);

			// public, followed
			const blog3 = new Blog(randomBlogParams());
			blog3.isPublic = true;
			await repo.blog.create(blog3);
			account.followBlog(blog3.id);

			// private, followed
			const blog4 = new Blog(randomBlogParams());
			blog4.isPublic = false;
			await repo.blog.create(blog4);
			account.followBlog(blog4.id);

			// update to save the follows
			await repo.account.update(account);

			const blogs = await query.blog.listAll(account);

			const listedBlog1 = blogs.find((blog) => blog.id === blog1.id);
			expect(listedBlog1).toBeDefined();
			expect(listedBlog1?.isFollowed).toEqual(false);

			const listedBlog2 = blogs.find((blog) => blog.id === blog2.id);
			expect(listedBlog2).toBeDefined();
			expect(listedBlog2?.isFollowed).toEqual(false);

			const listedBlog3 = blogs.find((blog) => blog.id === blog3.id);
			expect(listedBlog3).toBeDefined();
			expect(listedBlog3?.isFollowed).toEqual(true);

			const listedBlog4 = blogs.find((blog) => blog.id === blog4.id);
			expect(listedBlog4).toBeDefined();
			expect(listedBlog4?.isFollowed).toEqual(true);
		});
	});

	describe("listVisible", () => {
		it("should list only public or followed blogs", async () => {
			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			// public, not followed
			const blog1 = new Blog(randomBlogParams());
			blog1.isPublic = true;
			await repo.blog.create(blog1);

			// private, not followed
			const blog2 = new Blog(randomBlogParams());
			blog2.isPublic = false;
			await repo.blog.create(blog2);

			// public, followed
			const blog3 = new Blog(randomBlogParams());
			blog3.isPublic = true;
			await repo.blog.create(blog3);
			account.followBlog(blog3.id);

			// private, followed
			const blog4 = new Blog(randomBlogParams());
			blog4.isPublic = false;
			await repo.blog.create(blog4);
			account.followBlog(blog4.id);

			// update to save the follows
			await repo.account.update(account);

			const blogs = await query.blog.listVisible(account);

			const listedBlog1 = blogs.find((blog) => blog.id === blog1.id);
			expect(listedBlog1).toBeDefined();
			expect(listedBlog1?.isFollowed).toEqual(false);

			const listedBlog2 = blogs.find((blog) => blog.id === blog2.id);
			expect(listedBlog2).toBeUndefined();

			const listedBlog3 = blogs.find((blog) => blog.id === blog3.id);
			expect(listedBlog3).toBeDefined();
			expect(listedBlog3?.isFollowed).toEqual(true);

			const listedBlog4 = blogs.find((blog) => blog.id === blog4.id);
			expect(listedBlog4).toBeDefined();
			expect(listedBlog4?.isFollowed).toEqual(true);
		});
	});
});
