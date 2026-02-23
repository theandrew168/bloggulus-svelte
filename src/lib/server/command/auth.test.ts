import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/account";
import { Repository } from "$lib/server/repository";
import { Session } from "$lib/server/session";
import { randomAccountParams, randomSessionParams } from "$lib/server/test";
import { sha256 } from "$lib/server/utils";

import { AuthCommand } from "./auth";

describe("command/auth", () => {
	const repo = Repository.getInstance();
	const authCommand = new AuthCommand(repo);

	test("signIn", async () => {
		const account = new Account(randomAccountParams());
		await repo.account.create(account);

		const token = await authCommand.signIn(account.username);
		const tokenHash = sha256(token);

		const session = await repo.session.readByTokenHash(tokenHash);
		expect(session).toBeDefined();
		expect(session?.accountID).toEqual(account.id);
	});

	test("signOut", async () => {
		const account = new Account(randomAccountParams());
		await repo.account.create(account);

		const token = await authCommand.signIn(account.username);
		const tokenHash = sha256(token);

		const session = await repo.session.readByTokenHash(tokenHash);
		expect(session).toBeDefined();
		expect(session?.accountID).toEqual(account.id);

		await authCommand.signOut(token);

		const deletedSession = await repo.session.readByTokenHash(tokenHash);
		expect(deletedSession).toBeUndefined();
	});

	test("deleteExpiredSessions", async () => {
		const account = new Account(randomAccountParams());
		await repo.account.create(account);

		const now = new Date();

		const expiredSession = new Session({
			...randomSessionParams(account),
			expiresAt: new Date(now.getTime() - 1000),
		});
		await repo.session.create(expiredSession);

		const validSession = new Session({
			...randomSessionParams(account),
			expiresAt: new Date(now.getTime() + 1000),
		});
		await repo.session.create(validSession);

		await authCommand.deleteExpiredSessions(now);

		const deletedSession = await repo.session.readByID(expiredSession.id);
		expect(deletedSession).toBeUndefined();

		const preservedSession = await repo.session.readByID(validSession.id);
		expect(preservedSession).toBeDefined();
		expect(preservedSession?.id).toEqual(validSession.id);
	});
});
