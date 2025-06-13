import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Blog } from "$lib/server/blog";

import { PostgresRepository } from ".";

describe("repository/postgres/blog", () => {
	const chance = new Chance();
	const repo = PostgresRepository.getInstance();

	test("createOrUpdate", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.createOrUpdate(blog);
	});

	test("readByID", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.createOrUpdate(blog);

		const blogByID = await repo.blog.readByID(blog.id);
		expect(blogByID?.id).toEqual(blog.id);
	});

	test("readByFeedURL", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.createOrUpdate(blog);

		const blogByFeedURL = await repo.blog.readByFeedURL(blog.feedURL);
		expect(blogByFeedURL?.id).toEqual(blog.id);
	});

	test("delete", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.createOrUpdate(blog);

		await repo.blog.delete(blog);

		const blogByID = await repo.blog.readByID(blog.id);
		expect(blogByID).toBeUndefined();
	});
});
