import _ from "lodash";
import { expect, test } from "vitest";

import { isValidUuid } from "$lib/utils";
import { createPost, deletePost, listPostsByBlog, readPostById, updatePost } from "./post";
import { createBlog } from "./blog";
import { generateFakeBlog, generateFakePost } from "./fake";

test("createPost", async () => {
	const blog = await createBlog(generateFakeBlog());

	const params = generateFakePost(blog.id);
	const post = await createPost(params);
	expect(isValidUuid(post.id)).toEqual(true);
	expect(_.omit(post, "id")).toEqual(params);
});

test("listPostsByBlog", async () => {
	const blog = await createBlog(generateFakeBlog());

	const posts = await Promise.all([
		createPost(generateFakePost(blog.id)),
		createPost(generateFakePost(blog.id)),
		createPost(generateFakePost(blog.id)),
	]);

	const got = await listPostsByBlog(blog.id);
	const ids = got.map((post) => post.id);
	for (const post of posts) {
		expect(ids.includes(post.id)).toEqual(true);
	}
});

test("readPostById", async () => {
	const blog = await createBlog(generateFakeBlog());

	const params = generateFakePost(blog.id);
	const post = await createPost(params);
	const got = await readPostById(post.id);
	expect(got?.id).toEqual(post.id);
});

test("updatePost", async () => {
	const blog = await createBlog(generateFakeBlog());

	const params = generateFakePost(blog.id);
	const post = await createPost(params);

	const updates = generateFakePost(blog.id);
	await updatePost(post, updates);

	const got = await readPostById(post.id);
	expect(got?.id).toEqual(post.id);
	expect(_.omit(got, "id", "blogTitle", "blogUrl", "tags")).toEqual(updates);
});

test("deletePost", async () => {
	const blog = await createBlog(generateFakeBlog());

	const params = generateFakePost(blog.id);
	const post = await createPost(params);
	await deletePost(post);
	const got = await readPostById(post.id);
	expect(got).toBeNull;
});
