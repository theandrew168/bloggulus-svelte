import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/account";
import { Blog } from "$lib/server/blog";
import { newAccount, newBlog } from "$lib/server/test";

import { Repository } from ".";

describe("repository/account", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();

	test("create", async () => {
		const account = newAccount();
		await repo.account.create(account);
	});

	test("readByID", async () => {
		const account = newAccount();
		await repo.account.create(account);

		const accountByID = await repo.account.readByID(account.id);
		expect(accountByID?.id).toEqual(account.id);
		expect(accountByID?.username).toEqual(account.username);
		expect(accountByID?.isAdmin).toEqual(account.isAdmin);
		expect(accountByID?.followedBlogIDs).toEqual(account.followedBlogIDs);
	});

	test("readByUsername", async () => {
		const account = newAccount();
		await repo.account.create(account);

		const accountByUsername = await repo.account.readByUsername(account.username);
		expect(accountByUsername?.id).toEqual(account.id);
		expect(accountByUsername?.username).toEqual(account.username);
		expect(accountByUsername?.isAdmin).toEqual(account.isAdmin);
		expect(accountByUsername?.followedBlogIDs).toEqual(account.followedBlogIDs);
	});

	test("update", async () => {
		const account = newAccount();
		await repo.account.create(account);

		const blog = newBlog();
		await repo.blog.create(blog);

		account.followBlog(blog.id);
		await repo.account.update(account);

		let accountByID = await repo.account.readByID(account.id);
		expect(accountByID?.followedBlogIDs).toContain(blog.id);

		account.unfollowBlog(blog.id);
		await repo.account.update(account);

		accountByID = await repo.account.readByID(account.id);
		expect(accountByID?.followedBlogIDs).not.toContain(blog.id);
	});

	test("delete", async () => {
		const account = newAccount();
		await repo.account.create(account);

		await repo.account.delete(account);

		const accountByID = await repo.account.readByID(account.id);
		expect(accountByID).toBeUndefined();
	});
});
