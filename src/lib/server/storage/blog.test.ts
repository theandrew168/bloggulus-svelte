import { expect, test } from "vitest";
import { faker } from "@faker-js/faker";

import { createBlog, type CreateBlogParams } from "./blog";
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
