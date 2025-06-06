import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/account";

import { PostgresRepository } from "./repository";

describe("repository/postgres/account", () => {
	const chance = new Chance();
	const repo = PostgresRepository.getInstance();

	test("createOrUpdate", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.createOrUpdate(account);
	});

	test("readByID", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.createOrUpdate(account);

		const accountByID = await repo.account.readByID(account.id);
		expect(accountByID?.id).toEqual(account.id);
	});

	test("readByUsername", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.createOrUpdate(account);

		const accountByUsername = await repo.account.readByUsername(account.username);
		expect(accountByUsername?.id).toEqual(account.id);
	});

	test("delete", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.createOrUpdate(account);

		await repo.account.delete(account);

		const accountByID = await repo.account.readByID(account.id);
		expect(accountByID).toBeUndefined();
	});
});
