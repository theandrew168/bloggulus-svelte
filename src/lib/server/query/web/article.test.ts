import { beforeAll, describe, expect, it } from "vitest";

import { Account } from "$lib/server/account";
import { Blog } from "$lib/server/blog";
import { Post } from "$lib/server/post";
import { Repository } from "$lib/server/repository";
import { Tag } from "$lib/server/tag";
import { randomAccountParams, randomBlogParams, randomPostParams, randomTagParams } from "$lib/server/test";

import { WebQuery } from ".";

async function ensureTagExists(repo: Repository, name: string): Promise<Tag> {
	const tag = new Tag({
		...randomTagParams(),
		name,
	});

	try {
		await repo.tag.create(tag);
	} catch (error) {
		// Ignore duplicate tag errors.
	}

	return tag;
}

describe("query/web/article", () => {
	const repo = Repository.getInstance();

	const query = WebQuery.getInstance();

	beforeAll(async () => {
		await ensureTagExists(repo, "TypeScript");
	});

	describe("countRecent", () => {
		it("should count recent articles", async () => {
			const blog = new Blog(randomBlogParams());
			blog.isPublic = true;
			await repo.blog.create(blog);

			const post1 = new Post(randomPostParams(blog));
			await repo.post.create(post1);

			const post2 = new Post(randomPostParams(blog));
			await repo.post.create(post2);

			const count = await query.article.countRecent();
			expect(count).toBeGreaterThanOrEqual(2);
		});
	});

	describe("listRecent", () => {
		it("should list recent articles", async () => {
			const blog = new Blog(randomBlogParams());
			blog.isPublic = true;
			await repo.blog.create(blog);

			const post1 = new Post(randomPostParams(blog));
			await repo.post.create(post1);

			const post2 = new Post(randomPostParams(blog));
			await repo.post.create(post2);

			const articles = await query.article.listRecent(10, 0);
			expect(articles.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("countRecentByAccount", () => {
		it("should count recent articles by account", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const post1 = new Post(randomPostParams(blog));
			await repo.post.create(post1);

			const post2 = new Post(randomPostParams(blog));
			await repo.post.create(post2);

			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			account.followBlog(blog.id);
			await repo.account.update(account);

			const count = await query.article.countRecentByAccount(account);
			expect(count).toEqual(2);
		});

		it("should return 0 if the account is not following any blogs", async () => {
			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			const count = await query.article.countRecentByAccount(account);
			expect(count).toEqual(0);
		});
	});

	describe("listRecentByAccount", () => {
		it("should list recent articles by account", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const post1 = new Post(randomPostParams(blog));
			await repo.post.create(post1);

			const post2 = new Post(randomPostParams(blog));
			await repo.post.create(post2);

			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			account.followBlog(blog.id);
			await repo.account.update(account);

			const articles = await query.article.listRecentByAccount(account, 10, 0);
			expect(articles.length).toEqual(2);

			expect(articles[0]?.title).toEqual(post2.title);
			expect(articles[0]?.url.toString()).toEqual(post2.url.toString());
			expect(articles[0]?.blogTitle).toEqual(blog.title);
			expect(articles[0]?.blogURL.toString()).toEqual(blog.siteURL.toString());
			expect(articles[0]?.publishedAt).toEqual(post2.publishedAt);

			expect(articles[1]?.title).toEqual(post1.title);
			expect(articles[1]?.url.toString()).toEqual(post1.url.toString());
			expect(articles[1]?.blogTitle).toEqual(blog.title);
			expect(articles[1]?.blogURL.toString()).toEqual(blog.siteURL.toString());
			expect(articles[1]?.publishedAt).toEqual(post1.publishedAt);
		});

		it("should return no articles if the account is not following any blogs", async () => {
			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			const articles = await query.article.listRecentByAccount(account, 10, 0);
			expect(articles.length).toEqual(0);
		});
	});

	describe("countRelevant", () => {
		it("should count relevant articles", async () => {
			const blog = new Blog(randomBlogParams());
			blog.isPublic = true;
			await repo.blog.create(blog);

			const post1 = new Post({
				...randomPostParams(blog),
				title: "TypeScript Rocks!",
				content: "TypeScript TypeScript TypeScript",
			});
			await repo.post.create(post1);

			const post2 = new Post({
				...randomPostParams(blog),
				title: "TypeScript Rocks!",
				content: "TypeScript TypeScript TypeScript",
			});
			await repo.post.create(post2);

			const count = await query.article.countRelevant("TypeScript");
			expect(count).toBeGreaterThanOrEqual(2);
		});
	});

	describe("listRelevant", () => {
		it("should list relevant articles", async () => {
			const blog = new Blog(randomBlogParams());
			blog.isPublic = true;
			await repo.blog.create(blog);

			const post1 = new Post({
				...randomPostParams(blog),
				title: "TypeScript Rocks!",
				content: "TypeScript TypeScript TypeScript",
			});
			await repo.post.create(post1);

			const post2 = new Post({
				...randomPostParams(blog),
				title: "TypeScript Rocks!",
				content: "TypeScript TypeScript TypeScript",
			});
			await repo.post.create(post2);

			const articles = await query.article.listRelevant("TypeScript", 10, 0);
			expect(articles.length).toBeGreaterThanOrEqual(2);

			expect(articles[0]?.tags).toContain("TypeScript");
			expect(articles[1]?.tags).toContain("TypeScript");
		});
	});

	describe("countRelevantByAccount", () => {
		it("should count relevant articles by account", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const post1 = new Post({
				...randomPostParams(blog),
				title: "TypeScript Rocks!",
				content: "TypeScript TypeScript TypeScript",
			});
			await repo.post.create(post1);

			const post2 = new Post({
				...randomPostParams(blog),
				title: "TypeScript Rocks!",
				content: "TypeScript TypeScript TypeScript",
			});
			await repo.post.create(post2);

			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			account.followBlog(blog.id);
			await repo.account.update(account);

			const count = await query.article.countRelevantByAccount(account, "TypeScript");
			expect(count).toEqual(2);
		});

		it("should return 0 if no relevant articles are found", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const post1 = new Post(randomPostParams(blog));
			await repo.post.create(post1);

			const post2 = new Post(randomPostParams(blog));
			await repo.post.create(post2);

			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			account.followBlog(blog.id);
			await repo.account.update(account);

			const count = await query.article.countRelevantByAccount(account, "TypeScript");
			expect(count).toEqual(0);
		});
	});

	describe("listRelevantByAccount", () => {
		it("should list relevant articles by account", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const post1 = new Post({
				...randomPostParams(blog),
				title: "TypeScript Rocks!",
				content: "TypeScript TypeScript TypeScript",
			});
			await repo.post.create(post1);

			const post2 = new Post({
				...randomPostParams(blog),
				title: "TypeScript Rocks!",
				content: "TypeScript TypeScript TypeScript",
			});
			await repo.post.create(post2);

			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			account.followBlog(blog.id);
			await repo.account.update(account);

			const articles = await query.article.listRelevantByAccount(account, "TypeScript", 10, 0);
			expect(articles.length).toEqual(2);

			expect(articles[0]?.tags).toContain("TypeScript");
			expect(articles[1]?.tags).toContain("TypeScript");
		});

		it("should return no articles if none are relevant", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const post1 = new Post(randomPostParams(blog));
			await repo.post.create(post1);

			const post2 = new Post(randomPostParams(blog));
			await repo.post.create(post2);

			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			account.followBlog(blog.id);
			await repo.account.update(account);

			const articles = await query.article.listRelevantByAccount(account, "TypeScript", 10, 0);
			expect(articles.length).toEqual(0);
		});
	});
});
