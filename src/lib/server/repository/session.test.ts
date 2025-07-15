import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/account";
import { generateSessionToken, Session } from "$lib/server/session";
import { randomAccountParams, randomSessionParams } from "$lib/server/test";

import { Repository } from ".";

describe("repository/session", () => {
	const repo = Repository.getInstance();

	test("create", async () => {
		const account = new Account(randomAccountParams());
		await repo.account.create(account);

		const session = new Session(randomSessionParams(account));
		const token = generateSessionToken();
		await repo.session.create(session, token);
	});

	test("readByID", async () => {
		const account = new Account(randomAccountParams());
		await repo.account.create(account);

		const session = new Session(randomSessionParams(account));
		const token = generateSessionToken();
		await repo.session.create(session, token);

		const sessionByID = await repo.session.readByID(session.id);
		expect(sessionByID?.id).toEqual(session.id);
	});

	test("readByToken", async () => {
		const account = new Account(randomAccountParams());
		await repo.account.create(account);

		const session = new Session(randomSessionParams(account));
		const token = generateSessionToken();
		await repo.session.create(session, token);

		const sessionByToken = await repo.session.readByToken(token);
		expect(sessionByToken?.id).toEqual(session.id);
	});

	test("listExpired", async () => {
		const account = new Account(randomAccountParams());
		await repo.account.create(account);

		const now = new Date();

		const expiredSession = new Session({
			...randomSessionParams(account),
			expiresAt: new Date(now.getTime() - 1000),
		});
		await repo.session.create(expiredSession, generateSessionToken());

		const validSession = new Session({
			...randomSessionParams(account),
			expiresAt: new Date(now.getTime() + 1000),
		});
		await repo.session.create(validSession, generateSessionToken());

		const expiredSessions = await repo.session.listExpired(now);
		const expiredSessionsForAccount = expiredSessions.filter((session) => session.accountID === account.id);
		expect(expiredSessionsForAccount.length).toBe(1);
		expect(expiredSessionsForAccount[0]?.id).toEqual(expiredSession.id);
	});

	test("delete", async () => {
		const account = new Account(randomAccountParams());
		await repo.account.create(account);

		const session = new Session(randomSessionParams(account));
		const token = generateSessionToken();
		await repo.session.create(session, token);

		await repo.session.delete(session);

		const sessionByID = await repo.session.readByID(session.id);
		expect(sessionByID).toBeUndefined();
	});
});
