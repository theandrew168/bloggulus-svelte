import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/account";
import { Blog } from "$lib/server/blog";

import { PostgresRepository } from ".";

describe("repository/postgres/account", () => {
	const chance = new Chance();
	const repo = PostgresRepository.getInstance();

	test("create", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);
	});

	test("readByID", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const accountByID = await repo.account.readByID(account.id);
		expect(accountByID?.id).toEqual(account.id);
		expect(accountByID?.username).toEqual(account.username);
		expect(accountByID?.isAdmin).toEqual(account.isAdmin);
		expect(accountByID?.followedBlogIDs).toEqual(account.followedBlogIDs);
	});

	test("readByUsername", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const accountByUsername = await repo.account.readByUsername(account.username);
		expect(accountByUsername?.id).toEqual(account.id);
		expect(accountByUsername?.username).toEqual(account.username);
		expect(accountByUsername?.isAdmin).toEqual(account.isAdmin);
		expect(accountByUsername?.followedBlogIDs).toEqual(account.followedBlogIDs);
	});

	test("update", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const blog = new Blog({
			feedURL: chance.url(),
			siteURL: chance.url(),
			title: chance.sentence({ words: 3 }),
		});
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
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		await repo.account.delete(account);

		const accountByID = await repo.account.readByID(account.id);
		expect(accountByID).toBeUndefined();
	});
});
