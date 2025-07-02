import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Blog } from "$lib/server/blog";
import { Post } from "$lib/server/post";
import { Repository } from "$lib/server/repository";

import { PostCommand } from "./post";

describe("command/post", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();
	const postCommand = new PostCommand(repo);

	test("deletePost", async () => {
		const blog = new Blog({
			feedURL: new URL(chance.url()),
			siteURL: new URL(chance.url()),
			title: chance.sentence({ words: 3 }),
			syncedAt: new Date(),
		});
		await repo.blog.create(blog);

		const post = new Post({
			blogID: blog.id,
			url: new URL(chance.url()),
			title: chance.sentence({ words: 5 }),
			publishedAt: new Date(),
		});
		await repo.post.create(post);

		const existingPost = await repo.post.readByID(post.id);
		expect(existingPost).toBeDefined();

		await postCommand.deletePost(post.id);

		const deletedPost = await repo.post.readByID(post.id);
		expect(deletedPost).toBeUndefined();
	});
});
