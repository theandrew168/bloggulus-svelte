import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/domain/account";

import { PostgresAccountRepository } from "./account";

describe("PostgresAccountRepository", () => {
	const chance = new Chance();
	const repo = PostgresAccountRepository.getInstance();

	test("createOrUpdate", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.createOrUpdate(account);
	});

	test("readById", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.createOrUpdate(account);

		const accountByID = await repo.readByID(account.id);
		expect(accountByID?.id).toEqual(account.id);
	});

	test("delete", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.createOrUpdate(account);

		await repo.delete(account);

		const accountByID = await repo.readByID(account.id);
		expect(accountByID).toBeUndefined();
	});
});
