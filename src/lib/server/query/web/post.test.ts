import { describe, expect, it } from "vitest";

import { Blog } from "$lib/server/blog";
import { Post } from "$lib/server/post";
import { Repository } from "$lib/server/repository";
import { randomBlogParams, randomPostParams } from "$lib/server/test";

import { WebQuery } from ".";

describe("query/web/post", () => {
	const repo = Repository.getInstance();

	const query = WebQuery.getInstance();

	describe("readDetailsByID", () => {
		it("should read post details by ID", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const post = new Post(randomPostParams(blog));
			await repo.post.create(post);

			const postDetails = await query.post.readDetailsByID(post.id);
			expect(postDetails).toBeDefined();

			expect(postDetails?.id).toEqual(post.id);
			expect(postDetails?.blogID).toEqual(blog.id);
			expect(postDetails?.url).toEqual(post.url);
			expect(postDetails?.title).toEqual(post.title);
			expect(postDetails?.publishedAt).toEqual(post.publishedAt);
		});

		it("should return undefined for invalid post IDs", async () => {
			const invalidPostID = crypto.randomUUID();

			const postDetails = await query.post.readDetailsByID(invalidPostID);
			expect(postDetails).toBeUndefined();
		});
	});

	describe("listDetailsByBlogID", () => {
		it("should list post details by blog ID", async () => {
			const blog = new Blog(randomBlogParams());
			await repo.blog.create(blog);

			const post1 = new Post(randomPostParams(blog));
			await repo.post.create(post1);

			const post2 = new Post(randomPostParams(blog));
			await repo.post.create(post2);

			const postDetailsList = await query.post.listDetailsByBlogID(blog.id);
			expect(postDetailsList).toHaveLength(2);

			expect(postDetailsList[0]?.blogID).toEqual(blog.id);
			expect(postDetailsList[1]?.blogID).toEqual(blog.id);
		});
	});
});
