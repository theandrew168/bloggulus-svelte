import { describe, expect, it, test } from "vitest";

import { Repository } from "$lib/server/repository";
import { createNewAccount, createNewBlog, newAccount } from "$lib/server/test";

import { AccountCommand } from "./account";
import { AdminAccountDeletionError } from "./errors";

describe("command/account", () => {
	const repo = Repository.getInstance();
	const accountCommand = new AccountCommand(repo);

	test("followBlog", async () => {
		const account = await createNewAccount(repo);
		const blog = await createNewBlog(repo);

		await accountCommand.followBlog(account.id, blog.id);

		const followingAccount = await repo.account.readByID(account.id);
		expect(followingAccount?.followedBlogIDs).toContain(blog.id);
	});

	test("unfollowBlog", async () => {
		const account = await createNewAccount(repo);
		const blog = await createNewBlog(repo);

		await accountCommand.followBlog(account.id, blog.id);

		const followingAccount = await repo.account.readByID(account.id);
		expect(followingAccount?.followedBlogIDs).toContain(blog.id);

		await accountCommand.unfollowBlog(account.id, blog.id);

		const unfollowingAccount = await repo.account.readByID(account.id);
		expect(unfollowingAccount?.followedBlogIDs).not.toContain(blog.id);
	});

	test("deleteAccount", async () => {
		const account = await createNewAccount(repo);

		const existingAccount = await repo.account.readByID(account.id);
		expect(existingAccount).toBeDefined();

		await accountCommand.deleteAccount(account.id);

		const deletedAccount = await repo.account.readByID(account.id);
		expect(deletedAccount).toBeUndefined();
	});

	it("should throw an error when trying to delete an admin account", async () => {
		const account = newAccount();
		account.isAdmin = true;
		await repo.account.create(account);

		const existingAccount = await repo.account.readByID(account.id);
		expect(existingAccount).toBeDefined();

		await expect(accountCommand.deleteAccount(account.id)).rejects.toThrowError(AdminAccountDeletionError);

		const stillExistingAccount = await repo.account.readByID(account.id);
		expect(stillExistingAccount).toBeDefined();
	});
});
