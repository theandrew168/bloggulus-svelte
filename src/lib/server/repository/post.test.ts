import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Blog } from "$lib/server/blog";
import { Post } from "$lib/server/post";
import { randomBlogParams, randomPostParams } from "$lib/server/test";

import { Repository } from ".";

describe("repository/post", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();

	test("create", async () => {
		const blog = new Blog(randomBlogParams());
		await repo.blog.create(blog);

		const post = new Post(randomPostParams(blog));
		await repo.post.create(post);
	});

	test("readByID", async () => {
		const blog = new Blog(randomBlogParams());
		await repo.blog.create(blog);

		const post = new Post(randomPostParams(blog));
		await repo.post.create(post);

		const postByID = await repo.post.readByID(post.id);
		expect(postByID?.id).toEqual(post.id);
	});

	test("update", async () => {
		const blog = new Blog(randomBlogParams());
		await repo.blog.create(blog);

		const post = new Post(randomPostParams(blog));
		await repo.post.create(post);

		post.title = chance.sentence({ words: 5 });
		post.publishedAt = new Date();
		post.content = chance.paragraph({ sentences: 3 });
		await repo.post.update(post);

		const postByID = await repo.post.readByID(post.id);
		expect(postByID?.title).toEqual(post.title);
		expect(postByID?.publishedAt).toEqual(post.publishedAt);
		expect(postByID?.content).toEqual(post.content);
	});

	test("delete", async () => {
		const blog = new Blog(randomBlogParams());
		await repo.blog.create(blog);

		const post = new Post(randomPostParams(blog));
		await repo.post.create(post);

		await repo.post.delete(post);

		const postByID = await repo.post.readByID(post.id);
		expect(postByID).toBeUndefined();
	});
});
