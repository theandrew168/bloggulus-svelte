import _ from "lodash";
import { describe, expect, test } from "vitest";

import { isValidUuid } from "$lib/utils";
import { generateFakeBlog } from "./fake";
import { connect } from "./storage";

describe("BlogStorage", () => {
	const storage = connect();

	test("create", async () => {
		const params = generateFakeBlog();
		const blog = await storage.blog.create(params);
		expect(isValidUuid(blog.id)).toEqual(true);
		expect(_.omit(blog, "id")).toEqual(params);
	});

	test("list", async () => {
		const blogs = await Promise.all([
			storage.blog.create(generateFakeBlog()),
			storage.blog.create(generateFakeBlog()),
			storage.blog.create(generateFakeBlog()),
		]);

		const got = await storage.blog.list();
		const ids = got.map((blog) => blog.id);
		for (const blog of blogs) {
			expect(ids.includes(blog.id)).toEqual(true);
		}
	});

	test("readById", async () => {
		const params = generateFakeBlog();
		const blog = await storage.blog.create(params);
		const got = await storage.blog.readById(blog.id);
		expect(got?.id).toEqual(blog.id);
	});

	test("readByFeedUrl", async () => {
		const params = generateFakeBlog();
		const blog = await storage.blog.create(params);
		const got = await storage.blog.readByFeedUrl(blog.feedUrl);
		expect(got?.id).toEqual(blog.id);
	});

	test("update", async () => {
		const params = generateFakeBlog();
		const blog = await storage.blog.create(params);

		const updates = generateFakeBlog();
		await storage.blog.update(blog, updates);

		const got = await storage.blog.readById(blog.id);
		expect(got?.id).toEqual(blog.id);
		expect(_.omit(got, "id")).toEqual(updates);
	});

	test("delete", async () => {
		const params = generateFakeBlog();
		const blog = await storage.blog.create(params);
		await storage.blog.delete(blog);
		const got = await storage.blog.readById(blog.id);
		expect(got).toBeNull;
	});
});
