import Chance from "chance";
import { describe, expect, it, test } from "vitest";

import { Account } from "$lib/server/account";
import { Repository } from "$lib/server/repository";

import { AccountCommand } from "./account";

describe("command/account", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();
	const accountCommand = new AccountCommand(repo);

	// TODO: Test for followBlog.
	// TODO: Test for unfollowBlog.

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

		await expect(accountCommand.deleteAccount(adminAccount.id)).rejects.toThrowError(
			new Error("Cannot delete admin account"),
		);

		const stillExistingAccount = await repo.account.readByID(adminAccount.id);
		expect(stillExistingAccount).toBeDefined();
	});
});
