import { expect, test } from "vitest";
import { faker } from "@faker-js/faker";

import {
	createBlog,
	listBlogs,
	type CreateBlogParams,
	readBlogById,
	readBlogByFeedUrl,
	deleteBlogById,
	updateBlog,
	updateBlogSyncedAt,
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
	expect(blog.feedUrl).toEqual(params.feedUrl);
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
	await updateBlog(blog.id, "foo", "bar");
	const got = await readBlogById(blog.id);
	expect(got?.id).toEqual(blog.id);
	expect(got?.etag).toEqual("foo");
	expect(got?.lastModified).toEqual("bar");
});

test("updateBlogSyncedAt", async () => {
	const params = generateFakeBlog();
	const blog = await createBlog(params);
	const syncedAt = faker.date.past();
	await updateBlogSyncedAt(blog.id, syncedAt);
	const got = await readBlogById(blog.id);
	expect(got?.id).toEqual(blog.id);
	expect(got?.syncedAt).toEqual(syncedAt);
});

test("deleteBlogById", async () => {
	const params = generateFakeBlog();
	const blog = await createBlog(params);
	await deleteBlogById(blog.id);
	const got = await readBlogById(blog.id);
	expect(got).toBeNull;
});
