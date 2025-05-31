import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/domain/account";

import { PostgresAccountRepository } from "./account";

describe("PostgresAccountRepository", () => {
	const chance = new Chance();
	const accountRepo = PostgresAccountRepository.getInstance();

	test("createOrUpdate", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await accountRepo.createOrUpdate(account);
	});

	test("readById", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await accountRepo.createOrUpdate(account);

		const accountByID = await accountRepo.readByID(account.id);
		expect(accountByID?.id).toEqual(account.id);
	});

	test("readByUsername", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await accountRepo.createOrUpdate(account);

		const accountByID = await accountRepo.readByUsername(account.username);
		expect(accountByID?.id).toEqual(account.id);
	});

	test("delete", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await accountRepo.createOrUpdate(account);

		await accountRepo.delete(account);

		const accountByID = await accountRepo.readByID(account.id);
		expect(accountByID).toBeUndefined();
	});
});
