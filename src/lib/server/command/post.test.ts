import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Blog } from "../blog";
import { Post } from "../post";
import { PostgresRepository } from "../repository/postgres";
import { PostCommand } from "./post";

describe("command/post", () => {
	const chance = new Chance();
	const repo = PostgresRepository.getInstance();
	const postCommand = new PostCommand(repo);

	test("deletePost", async () => {
		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 3 }),
			syncedAt: new Date(),
		});
		await repo.blog.create(blog);

		const post = new Post({
			blogID: blog.id,
			url: chance.url(),
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
