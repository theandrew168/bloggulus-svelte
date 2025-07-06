import Chance from "chance";
import { describe, expect, test } from "vitest";

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
});
