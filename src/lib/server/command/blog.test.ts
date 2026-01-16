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

	test("showBlog", async () => {
		const blog = new Blog(randomBlogParams());
		blog.isPublic = false;
		await repo.blog.create(blog);

		const existingBlog = await repo.blog.readByID(blog.id);
		expect(existingBlog).toBeDefined();
		expect(existingBlog?.isPublic).toBe(false);

		await blogCommand.showBlog(blog.id);

		const updatedBlog = await repo.blog.readByID(blog.id);
		expect(updatedBlog).toBeDefined();
		expect(updatedBlog?.isPublic).toBe(true);
	});

	test("hideBlog", async () => {
		const blog = new Blog(randomBlogParams());
		blog.isPublic = true;
		await repo.blog.create(blog);

		const existingBlog = await repo.blog.readByID(blog.id);
		expect(existingBlog).toBeDefined();
		expect(existingBlog?.isPublic).toBe(true);

		await blogCommand.hideBlog(blog.id);

		const updatedBlog = await repo.blog.readByID(blog.id);
		expect(updatedBlog).toBeDefined();
		expect(updatedBlog?.isPublic).toBe(false);
	});
});
