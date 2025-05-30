import _ from "lodash";
import { describe, expect, test } from "vitest";

import { isValidUuid } from "$lib/utils";

import { RollbackError } from "./errors";
import { generateFakeBlog, generateFakePost } from "./fake";
import { connect } from "./storage";

describe("PostStorage", () => {
	const storage = connect();

	test("create", async () => {
		await storage.transaction(async (storage) => {
			const blog = await storage.blog.create(generateFakeBlog());

			const params = generateFakePost(blog.id);
			const post = await storage.post.create(params);
			expect(isValidUuid(post.id)).toEqual(true);
			expect(_.omit(post, "id")).toEqual(params);

			throw new RollbackError();
		});
	});

	test("listByBlog", async () => {
		await storage.transaction(async (storage) => {
			const blog = await storage.blog.create(generateFakeBlog());

			const posts = await Promise.all([
				storage.post.create(generateFakePost(blog.id)),
				storage.post.create(generateFakePost(blog.id)),
				storage.post.create(generateFakePost(blog.id)),
			]);

			const got = await storage.post.listByBlog(blog.id);
			const ids = got.map((post) => post.id);
			for (const post of posts) {
				expect(ids.includes(post.id)).toEqual(true);
			}

			throw new RollbackError();
		});
	});

	test("readById", async () => {
		await storage.transaction(async (storage) => {
			const blog = await storage.blog.create(generateFakeBlog());

			const params = generateFakePost(blog.id);
			const post = await storage.post.create(params);
			const got = await storage.post.readById(post.id);
			expect(got?.id).toEqual(post.id);

			throw new RollbackError();
		});
	});

	test("update", async () => {
		await storage.transaction(async (storage) => {
			const blog = await storage.blog.create(generateFakeBlog());

			const params = generateFakePost(blog.id);
			const post = await storage.post.create(params);

			const updates = generateFakePost(blog.id);
			await storage.post.update(post, updates);

			const got = await storage.post.readById(post.id);
			expect(got?.id).toEqual(post.id);
			expect(_.omit(got, "id", "blogTitle", "blogUrl", "tags")).toEqual(updates);

			throw new RollbackError();
		});
	});

	test("delete", async () => {
		await storage.transaction(async (storage) => {
			const blog = await storage.blog.create(generateFakeBlog());

			const params = generateFakePost(blog.id);
			const post = await storage.post.create(params);
			await storage.post.delete(post);
			const got = await storage.post.readById(post.id);
			expect(got).toBeNull;

			throw new RollbackError();
		});
	});
});
