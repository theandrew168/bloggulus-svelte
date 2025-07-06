import Chance from "chance";
import { describe, expect, it, test } from "vitest";

import { Account } from "$lib/server/account";
import { Blog } from "$lib/server/blog";
import { Repository } from "$lib/server/repository";

import { AccountCommand } from "./account";
import { AdminAccountDeletionError } from "./errors";

describe("command/account", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();
	const accountCommand = new AccountCommand(repo);

	test("followBlog", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const blog = new Blog({
			feedURL: new URL(chance.url()),
			siteURL: new URL(chance.url()),
			title: chance.sentence({ words: 3 }),
			syncedAt: new Date(),
		});
		await repo.blog.create(blog);

		await accountCommand.followBlog(account.id, blog.id);

		const followingAccount = await repo.account.readByID(account.id);
		expect(followingAccount?.followedBlogIDs).toContain(blog.id);
	});

	test("unfollowBlog", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const blog = new Blog({
			feedURL: new URL(chance.url()),
			siteURL: new URL(chance.url()),
			title: chance.sentence({ words: 3 }),
			syncedAt: new Date(),
		});
		await repo.blog.create(blog);

		await accountCommand.followBlog(account.id, blog.id);

		const followingAccount = await repo.account.readByID(account.id);
		expect(followingAccount?.followedBlogIDs).toContain(blog.id);

		await accountCommand.unfollowBlog(account.id, blog.id);

		const unfollowingAccount = await repo.account.readByID(account.id);
		expect(unfollowingAccount?.followedBlogIDs).not.toContain(blog.id);
	});

	test("deleteAccount", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const existingAccount = await repo.account.readByID(account.id);
		expect(existingAccount).toBeDefined();

		await accountCommand.deleteAccount(account.id);

		const deletedAccount = await repo.account.readByID(account.id);
		expect(deletedAccount).toBeUndefined();
	});

	it("should throw an error when trying to delete an admin account", async () => {
		const adminAccount = new Account({ username: chance.word({ length: 20 }) });
		adminAccount.isAdmin = true;
		await repo.account.create(adminAccount);

		const existingAccount = await repo.account.readByID(adminAccount.id);
		expect(existingAccount).toBeDefined();

		await expect(accountCommand.deleteAccount(adminAccount.id)).rejects.toThrowError(AdminAccountDeletionError);

		const stillExistingAccount = await repo.account.readByID(adminAccount.id);
		expect(stillExistingAccount).toBeDefined();
	});
});
