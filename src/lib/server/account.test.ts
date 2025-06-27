import Chance from "chance";
import { describe, expect, it } from "vitest";

import { Account } from "./account";

describe("account", () => {
	const chance = new Chance();

	describe("followBlog", () => {
		it("should add a blog ID to followedBlogIDs", () => {
			const account = new Account({ username: chance.word({ length: 20 }) });
			const blogID = crypto.randomUUID();
			account.followBlog(blogID);

			expect(account.followedBlogIDs).toHaveLength(1);
			expect(account.followedBlogIDs).toContain(blogID);
		});

		it("should not add the same blog ID multiple times", () => {
			const account = new Account({ username: chance.word({ length: 20 }) });
			const blogID = crypto.randomUUID();
			account.followBlog(blogID);
			account.followBlog(blogID);

			expect(account.followedBlogIDs).toHaveLength(1);
			expect(account.followedBlogIDs).toContain(blogID);
		});
	});

	describe("unfollowBlog", () => {
		it("should remove a blog ID from followedBlogIDs", () => {
			const account = new Account({ username: chance.word({ length: 20 }) });
			const blogID = crypto.randomUUID();
			account.followBlog(blogID);

			account.unfollowBlog(blogID);
			expect(account.followedBlogIDs).toHaveLength(0);
			expect(account.followedBlogIDs).not.toContain(blogID);
		});

		it("should not throw an error if the blog ID is not in followedBlogIDs", () => {
			const account = new Account({ username: chance.word({ length: 20 }) });
			const blogID = crypto.randomUUID();

			expect(() => account.unfollowBlog(blogID)).not.toThrow();
			expect(account.followedBlogIDs).toHaveLength(0);
		});
	});
});
