import { describe, expect, test } from "vitest";

import { Repository } from "$lib/server/repository";
import { createNewBlog, createNewPost } from "$lib/server/test";

import { PostCommand } from "./post";

describe("command/post", () => {
	const repo = Repository.getInstance();
	const postCommand = new PostCommand(repo);

	test("deletePost", async () => {
		const blog = await createNewBlog(repo);
		const post = await createNewPost(repo, blog);

		const existingPost = await repo.post.readByID(post.id);
		expect(existingPost).toBeDefined();

		await postCommand.deletePost(post.id);

		const deletedPost = await repo.post.readByID(post.id);
		expect(deletedPost).toBeUndefined();
	});
});
