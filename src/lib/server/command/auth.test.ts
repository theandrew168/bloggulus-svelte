import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/account";
import { Repository } from "$lib/server/repository";
import { generateSessionToken, Session } from "$lib/server/session";

import { AuthCommand } from "./auth";

describe("command/auth", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();
	const authCommand = new AuthCommand(repo);

	test("signIn", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const token = await authCommand.signIn(account.username);

		const session = await repo.session.readByToken(token);
		expect(session).toBeDefined();
		expect(session?.accountID).toEqual(account.id);
	});

	test("signOut", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const token = await authCommand.signIn(account.username);

		const session = await repo.session.readByToken(token);
		expect(session).toBeDefined();
		expect(session?.accountID).toEqual(account.id);

		await authCommand.signOut(token);

		const deletedSession = await repo.session.readByToken(token);
		expect(deletedSession).toBeUndefined();
	});

	test("deleteExpiredSessions", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const now = new Date();

		const expiredSession = new Session({ accountID: account.id, expiresAt: new Date(now.getTime() - 1000) });
		await repo.session.create(expiredSession, generateSessionToken());

		const validSession = new Session({ accountID: account.id, expiresAt: new Date(now.getTime() + 1000) });
		await repo.session.create(validSession, generateSessionToken());

		await authCommand.deleteExpiredSessions(now);

		const deletedSession = await repo.session.readByID(expiredSession.id);
		expect(deletedSession).toBeUndefined();

		const preservedSession = await repo.session.readByID(validSession.id);
		expect(preservedSession).toBeDefined();
		expect(preservedSession?.id).toEqual(validSession.id);
	});
});
