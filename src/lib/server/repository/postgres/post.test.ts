import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Blog } from "$lib/server/blog";
import { Post } from "$lib/server/post";

import { PostgresBlogRepository } from "./blog";
import { PostgresPostRepository } from "./post";

describe("PostgresPostRepository", () => {
	const chance = new Chance();
	const blogRepo = PostgresBlogRepository.getInstance();
	const postRepo = PostgresPostRepository.getInstance();

	test("createOrUpdate", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await blogRepo.createOrUpdate(blog);

		const post = new Post({
			blogID: blog.id,
			url: chance.url(),
			title: chance.sentence({ words: 5 }),
			publishedAt: new Date(),
			content: chance.paragraph({ sentences: 3 }),
		});
		await postRepo.createOrUpdate(post);
	});

	test("readByID", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await blogRepo.createOrUpdate(blog);

		const post = new Post({
			blogID: blog.id,
			url: chance.url(),
			title: chance.sentence({ words: 5 }),
			publishedAt: new Date(),
			content: chance.paragraph({ sentences: 3 }),
		});
		await postRepo.createOrUpdate(post);

		const postByID = await postRepo.readByID(post.id);
		expect(postByID?.id).toEqual(post.id);
	});

	test("delete", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 5 }),
		});
		await blogRepo.createOrUpdate(blog);

		const post = new Post({
			blogID: blog.id,
			url: chance.url(),
			title: chance.sentence({ words: 5 }),
			publishedAt: new Date(),
			content: chance.paragraph({ sentences: 3 }),
		});
		await postRepo.createOrUpdate(post);

		await postRepo.delete(post);

		const postByID = await postRepo.readByID(post.id);
		expect(postByID).toBeUndefined();
	});
});
