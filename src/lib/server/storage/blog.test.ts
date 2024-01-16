import * as _ from "lodash";
import { expect, test } from "vitest";
import { faker } from "@faker-js/faker";

import {
	createBlog,
	listBlogs,
	type CreateBlogParams,
	readBlogById,
	readBlogByFeedUrl,
	deleteBlog,
	updateBlog,
} from "./blog";
import { isValidUuid } from "$lib/utils";

function generateFakeBlog(): CreateBlogParams {
	const params: CreateBlogParams = {
		feedUrl: faker.internet.url(),
		siteUrl: faker.internet.url(),
		title: faker.lorem.words(),
		syncedAt: faker.date.past(),
		etag: faker.lorem.words(),
		lastModified: faker.lorem.words(),
	};
	return params;
}

test("createBlog", async () => {
	const params = generateFakeBlog();
	const blog = await createBlog(params);
	expect(isValidUuid(blog.id)).toEqual(true);
	expect(_.omit(blog, "id")).toEqual(params);
});

test("listBlogs", async () => {
	const blogs = await Promise.all([
		createBlog(generateFakeBlog()),
		createBlog(generateFakeBlog()),
		createBlog(generateFakeBlog()),
	]);

	const got = await listBlogs();
	const ids = got.map((blog) => blog.id);
	for (const blog of blogs) {
		expect(ids.includes(blog.id)).toEqual(true);
	}
});

test("readBlogById", async () => {
	const params = generateFakeBlog();
	const blog = await createBlog(params);
	const got = await readBlogById(blog.id);
	expect(got?.id).toEqual(blog.id);
});

test("readBlogByFeedUrl", async () => {
	const params = generateFakeBlog();
	const blog = await createBlog(params);
	const got = await readBlogByFeedUrl(blog.feedUrl);
	expect(got?.id).toEqual(blog.id);
});

test("updateBlog", async () => {
	const params = generateFakeBlog();
	const blog = await createBlog(params);

	const updates = generateFakeBlog();
	await updateBlog(blog, updates);

	const got = await readBlogById(blog.id);
	expect(got?.id).toEqual(blog.id);
	expect(_.omit(got, "id")).toEqual(updates);
});

test("deleteBlog", async () => {
	const params = generateFakeBlog();
	const blog = await createBlog(params);
	await deleteBlog(blog);
	const got = await readBlogById(blog.id);
	expect(got).toBeNull;
});
