import { describe, expect, it } from "vitest";

import { Account } from "./account";
import { randomAccountParams } from "./test";

describe("account", () => {
	describe("followBlog", () => {
		it("should add a blog ID to followedBlogIDs", () => {
			const account = new Account(randomAccountParams());
			const blogID = crypto.randomUUID();
			account.followBlog(blogID);

			expect(account.followedBlogIDs).toHaveLength(1);
			expect(account.followedBlogIDs).toContain(blogID);
		});

		it("should idempotently follow the same blog multiple times", () => {
			const account = new Account(randomAccountParams());
			const blogID = crypto.randomUUID();
			account.followBlog(blogID);
			account.followBlog(blogID);

			expect(account.followedBlogIDs).toHaveLength(1);
			expect(account.followedBlogIDs).toContain(blogID);
		});
	});

	describe("unfollowBlog", () => {
		it("should remove a blog ID from followedBlogIDs", () => {
			const account = new Account(randomAccountParams());
			const blogID = crypto.randomUUID();
			account.followBlog(blogID);

			account.unfollowBlog(blogID);
			expect(account.followedBlogIDs).toHaveLength(0);
			expect(account.followedBlogIDs).not.toContain(blogID);
		});

		it("should idempotently unfollow the same blog multiple times", () => {
			const account = new Account(randomAccountParams());
			const blogID = crypto.randomUUID();
			account.followBlog(blogID);

			account.unfollowBlog(blogID);
			account.unfollowBlog(blogID);
			expect(account.followedBlogIDs).toHaveLength(0);
			expect(account.followedBlogIDs).not.toContain(blogID);
		});
	});
});
