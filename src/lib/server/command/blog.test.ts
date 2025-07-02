import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Blog } from "$lib/server/blog";
import { Repository } from "$lib/server/repository";

import { BlogCommand } from "./blog";

describe("command/blog", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();
	const blogCommand = new BlogCommand(repo);

	test("deleteBlog", async () => {
		const blog = new Blog({
			feedURL: new URL(chance.url()),
			siteURL: new URL(chance.url()),
			title: chance.sentence({ words: 3 }),
			syncedAt: new Date(),
		});
		await repo.blog.create(blog);

		const existingBlog = await repo.blog.readByID(blog.id);
		expect(existingBlog).toBeDefined();

		await blogCommand.deleteBlog(blog.id);

		const deletedBlog = await repo.blog.readByID(blog.id);
		expect(deletedBlog).toBeUndefined();
	});
});
