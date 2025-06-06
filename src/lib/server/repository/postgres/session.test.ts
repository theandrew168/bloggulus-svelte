import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/account";
import { generateToken, Session } from "$lib/server/session";

import { PostgresRepository } from "./repository";

describe("repository/postgres/session", () => {
	const chance = new Chance();
	const repo = PostgresRepository.getInstance();

	test("createOrUpdate", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.createOrUpdate(account);

		const token = generateToken();
		const session = new Session({ accountID: account.id, expiresAt: new Date() });
		await repo.session.createOrUpdate(session, token);
	});

	test("readByID", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.createOrUpdate(account);

		const token = generateToken();
		const session = new Session({ accountID: account.id, expiresAt: new Date() });
		await repo.session.createOrUpdate(session, token);

		const sessionByID = await repo.session.readByID(session.id);
		expect(sessionByID?.id).toEqual(session.id);
	});

	test("readByToken", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.createOrUpdate(account);

		const token = generateToken();
		const session = new Session({ accountID: account.id, expiresAt: new Date() });
		await repo.session.createOrUpdate(session, token);

		const sessionByToken = await repo.session.readByToken(token);
		expect(sessionByToken?.id).toEqual(session.id);
	});

	test("listExpired", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.createOrUpdate(account);

		const now = new Date();

		const expiredSession = new Session({ accountID: account.id, expiresAt: new Date(now.getTime() - 1000) });
		await repo.session.createOrUpdate(expiredSession, generateToken());

		const validSession = new Session({ accountID: account.id, expiresAt: new Date(now.getTime() + 1000) });
		await repo.session.createOrUpdate(validSession, generateToken());

		const expiredSessions = await repo.session.listExpired(now);
		const expiredSessionsForAccount = expiredSessions.filter((session) => session.accountID === account.id);
		expect(expiredSessionsForAccount.length).toBe(1);
		expect(expiredSessionsForAccount[0].id).toEqual(expiredSession.id);
	});

	test("delete", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.createOrUpdate(account);

		const token = generateToken();
		const session = new Session({ accountID: account.id, expiresAt: new Date() });
		await repo.session.createOrUpdate(session, token);

		await repo.session.delete(session);

		const sessionByID = await repo.session.readByID(session.id);
		expect(sessionByID).toBeUndefined();
	});
});
