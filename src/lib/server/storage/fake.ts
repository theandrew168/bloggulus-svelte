import { faker } from "@faker-js/faker";

import type { CreateBlogParams } from "./blog";
import type { CreatePostParams } from "./post";
import type { CreateTagParams } from "./tag";

export function generateFakeBlog(): CreateBlogParams {
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

export function generateFakePost(blogId: string): CreatePostParams {
	const params: CreatePostParams = {
		url: faker.internet.url(),
		title: faker.lorem.words(),
		publishedAt: faker.date.past(),
		content: faker.lorem.words(),
		blogId,
	};
	return params;
}

export function generateFakeTag(): CreateTagParams {
	const params: CreateTagParams = {
		name: faker.string.alphanumeric(10),
	};
	return params;
}
