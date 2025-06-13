import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Blog } from "$lib/server/blog";
import { Post } from "$lib/server/post";

import { PostgresRepository } from ".";

describe("repository/postgres/post", () => {
	const chance = new Chance();
	const repo = PostgresRepository.getInstance();

	test("createOrUpdate", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.createOrUpdate(blog);

		const post = new Post({
			blogID: blog.id,
			url: chance.url(),
			title: chance.sentence({ words: 5 }),
			publishedAt: new Date(),
			content: chance.paragraph({ sentences: 3 }),
		});
		await repo.post.createOrUpdate(post);
	});

	test("readByID", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.createOrUpdate(blog);

		const post = new Post({
			blogID: blog.id,
			url: chance.url(),
			title: chance.sentence({ words: 5 }),
			publishedAt: new Date(),
			content: chance.paragraph({ sentences: 3 }),
		});
		await repo.post.createOrUpdate(post);

		const postByID = await repo.post.readByID(post.id);
		expect(postByID?.id).toEqual(post.id);
	});

	test("delete", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await repo.blog.createOrUpdate(blog);

		const post = new Post({
			blogID: blog.id,
			url: chance.url(),
			title: chance.sentence({ words: 5 }),
			publishedAt: new Date(),
			content: chance.paragraph({ sentences: 3 }),
		});
		await repo.post.createOrUpdate(post);

		await repo.post.delete(post);

		const postByID = await repo.post.readByID(post.id);
		expect(postByID).toBeUndefined();
	});
});
