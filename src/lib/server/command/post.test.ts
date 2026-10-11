import { describe, expect, test } from "vitest";

import { Blog } from "#lib/server/blog.js";
import { Post } from "#lib/server/post.js";
import { Repository } from "#lib/server/repository/index.js";
import { randomBlogParams, randomPostParams } from "#lib/server/test/index.js";

import { PostCommand } from "./post";

describe("command/post", () => {
	const repo = Repository.getInstance();
	const postCommand = new PostCommand(repo);

	test("deletePost", async () => {
		const blog = new Blog(randomBlogParams());
		await repo.blog.create(blog);

		const post = new Post(randomPostParams(blog));
		await repo.post.create(post);

		const existingPost = await repo.post.readByID(post.id);
		expect(existingPost).toBeDefined();

		await postCommand.deletePost(post.id);

		const deletedPost = await repo.post.readByID(post.id);
		expect(deletedPost).toBeUndefined();
	});
});
