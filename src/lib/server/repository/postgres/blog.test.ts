import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Blog } from "$lib/server/domain/blog";

import { PostgresBlogRepository } from "./blog";

describe("PostgresBlogRepository", () => {
	const chance = new Chance();
	const blogRepo = PostgresBlogRepository.getInstance();

	test("createOrUpdate", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await blogRepo.createOrUpdate(blog);
	});

	test("readByID", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await blogRepo.createOrUpdate(blog);

		const blogByID = await blogRepo.readByID(blog.id);
		expect(blogByID?.id).toEqual(blog.id);
	});

	test("readByFeedURL", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await blogRepo.createOrUpdate(blog);

		const blogByFeedURL = await blogRepo.readByFeedURL(blog.feedURL);
		expect(blogByFeedURL?.id).toEqual(blog.id);
	});

	test("delete", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await blogRepo.createOrUpdate(blog);

		await blogRepo.delete(blog);

		const blogByID = await blogRepo.readByID(blog.id);
		expect(blogByID).toBeUndefined();
	});
});
