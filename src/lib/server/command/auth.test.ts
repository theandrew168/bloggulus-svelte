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
