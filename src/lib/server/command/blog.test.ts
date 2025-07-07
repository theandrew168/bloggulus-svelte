import { describe, expect, test } from "vitest";

import { Repository } from "$lib/server/repository";
import { createNewBlog } from "$lib/server/test";

import { BlogCommand } from "./blog";

describe("command/blog", () => {
	const repo = Repository.getInstance();
	const blogCommand = new BlogCommand(repo);

	test("deleteBlog", async () => {
		const blog = await createNewBlog(repo);

		const existingBlog = await repo.blog.readByID(blog.id);
		expect(existingBlog).toBeDefined();

		await blogCommand.deleteBlog(blog.id);

		const deletedBlog = await repo.blog.readByID(blog.id);
		expect(deletedBlog).toBeUndefined();
	});
});
