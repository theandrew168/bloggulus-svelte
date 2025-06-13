import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Blog } from "$lib/server/blog";

import { PostgresRepository } from ".";

describe("repository/postgres/blog", () => {
	const chance = new Chance();
	const repo = PostgresRepository.getInstance();

	test("create", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.create(blog);
	});

	test("readByID", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.create(blog);

		const blogByID = await repo.blog.readByID(blog.id);
		expect(blogByID?.id).toEqual(blog.id);
	});

	test("readByFeedURL", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.create(blog);

		const blogByFeedURL = await repo.blog.readByFeedURL(blog.feedURL);
		expect(blogByFeedURL?.id).toEqual(blog.id);
	});

	test("update", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
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
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.create(blog);

		await repo.blog.delete(blog);

		const blogByID = await repo.blog.readByID(blog.id);
		expect(blogByID).toBeUndefined();
	});
});
