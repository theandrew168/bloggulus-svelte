import { describe, expect, test } from "vitest";

import { Blog } from "$lib/server/blog";
import { Repository } from "$lib/server/repository";
import { randomBlogParams } from "$lib/server/test";

import { BlogCommand } from "./blog";

describe("command/blog", () => {
	const repo = Repository.getInstance();
	const blogCommand = new BlogCommand(repo);

	test("deleteBlog", async () => {
		const blog = new Blog(randomBlogParams());
		await repo.blog.create(blog);

		const existingBlog = await repo.blog.readByID(blog.id);
		expect(existingBlog).toBeDefined();

		await blogCommand.deleteBlog(blog.id);

		const deletedBlog = await repo.blog.readByID(blog.id);
		expect(deletedBlog).toBeUndefined();
	});
});
