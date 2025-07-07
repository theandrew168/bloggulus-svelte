import Chance from "chance";
import { describe, expect, test } from "vitest";

import { newBlog } from "$lib/server/test";

import { Repository } from ".";

describe("repository/blog", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();

	test("create", async () => {
		const blog = newBlog();
		await repo.blog.create(blog);
	});

	test("readByID", async () => {
		const blog = newBlog();
		await repo.blog.create(blog);

		const blogByID = await repo.blog.readByID(blog.id);
		expect(blogByID?.id).toEqual(blog.id);
	});

	test("readByFeedURL", async () => {
		const blog = newBlog();
		await repo.blog.create(blog);

		const blogByFeedURL = await repo.blog.readByFeedURL(blog.feedURL);
		expect(blogByFeedURL?.id).toEqual(blog.id);
	});

	test("update", async () => {
		const blog = newBlog();
		await repo.blog.create(blog);

		blog.etag = chance.word();
		blog.lastModified = chance.word();
		blog.syncedAt = new Date();
		await repo.blog.update(blog);

		const blogByID = await repo.blog.readByID(blog.id);
		expect(blogByID?.etag).toEqual(blog.etag);
		expect(blogByID?.lastModified).toEqual(blog.lastModified);
		expect(blogByID?.syncedAt).toEqual(blog.syncedAt);
	});

	test("delete", async () => {
		const blog = newBlog();
		await repo.blog.create(blog);

		await repo.blog.delete(blog);

		const blogByID = await repo.blog.readByID(blog.id);
		expect(blogByID).toBeUndefined();
	});
});
