import Chance from "chance";
import { describe, expect, test } from "vitest";

import { generateSessionToken } from "$lib/server/session";
import { newAccount, newSession } from "$lib/server/test";

import { Repository } from ".";

describe("repository/session", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();

	test("create", async () => {
		const account = newAccount();
		await repo.account.create(account);

		const session = newSession(account);
		const token = generateSessionToken();
		await repo.session.create(session, token);
	});

	test("readByID", async () => {
		const account = newAccount();
		await repo.account.create(account);

		const session = newSession(account);
		const token = generateSessionToken();
		await repo.session.create(session, token);

		const sessionByID = await repo.session.readByID(session.id);
		expect(sessionByID?.id).toEqual(session.id);
	});

	test("readByToken", async () => {
		const account = newAccount();
		await repo.account.create(account);

		const session = newSession(account);
		const token = generateSessionToken();
		await repo.session.create(session, token);

		const sessionByToken = await repo.session.readByToken(token);
		expect(sessionByToken?.id).toEqual(session.id);
	});

	test("listExpired", async () => {
		const account = newAccount();
		await repo.account.create(account);

		const now = new Date();

		const expiredSession = newSession(account, new Date(now.getTime() - 1000));
		await repo.session.create(expiredSession, generateSessionToken());

		const validSession = newSession(account, new Date(now.getTime() + 1000));
		await repo.session.create(validSession, generateSessionToken());

		const expiredSessions = await repo.session.listExpired(now);
		const expiredSessionsForAccount = expiredSessions.filter((session) => session.accountID === account.id);
		expect(expiredSessionsForAccount.length).toBe(1);
		expect(expiredSessionsForAccount[0].id).toEqual(expiredSession.id);
	});

	test("delete", async () => {
		const account = newAccount();
		await repo.account.create(account);

		const session = newSession(account);
		const token = generateSessionToken();
		await repo.session.create(session, token);

		await repo.session.delete(session);

		const sessionByID = await repo.session.readByID(session.id);
		expect(sessionByID).toBeUndefined();
	});
});
