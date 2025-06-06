import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/account";
import { generateToken, Session } from "$lib/server/session";

import { PostgresAccountRepository } from "./account";
import { PostgresSessionRepository } from "./session";

describe("PostgresSessionRepository", () => {
	const chance = new Chance();
	const accountRepo = PostgresAccountRepository.getInstance();
	const sessionRepo = PostgresSessionRepository.getInstance();

	test("createOrUpdate", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await accountRepo.createOrUpdate(account);

		const token = generateToken();
		const session = new Session({ accountID: account.id, expiresAt: new Date() });
		await sessionRepo.createOrUpdate(session, token);
	});

	test("readByID", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await accountRepo.createOrUpdate(account);

		const token = generateToken();
		const session = new Session({ accountID: account.id, expiresAt: new Date() });
		await sessionRepo.createOrUpdate(session, token);

		const sessionByID = await sessionRepo.readByID(session.id);
		expect(sessionByID?.id).toEqual(session.id);
	});

	test("readByToken", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await accountRepo.createOrUpdate(account);

		const token = generateToken();
		const session = new Session({ accountID: account.id, expiresAt: new Date() });
		await sessionRepo.createOrUpdate(session, token);

		const sessionByToken = await sessionRepo.readByToken(token);
		expect(sessionByToken?.id).toEqual(session.id);
	});

	test("delete", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await accountRepo.createOrUpdate(account);

		const token = generateToken();
		const session = new Session({ accountID: account.id, expiresAt: new Date() });
		await sessionRepo.createOrUpdate(session, token);

		await sessionRepo.delete(session);

		const sessionByID = await sessionRepo.readByID(session.id);
		expect(sessionByID).toBeUndefined();
	});
});
