import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Account } from "$lib/server/account";
import { generateToken, Session } from "$lib/server/session";

import { PostgresRepository } from "../repository/postgres";
import { AuthCommand } from "./auth";

describe("command/auth", () => {
	const chance = new Chance();
	const repo = PostgresRepository.getInstance();
	const auth = new AuthCommand(repo);

	test("deleteExpiredSessions", async () => {
		const account = new Account({ username: chance.word({ length: 20 }) });
		await repo.account.create(account);

		const now = new Date();

		const expiredSession = new Session({ accountID: account.id, expiresAt: new Date(now.getTime() - 1000) });
		await repo.session.create(expiredSession, generateToken());

		const validSession = new Session({ accountID: account.id, expiresAt: new Date(now.getTime() + 1000) });
		await repo.session.create(validSession, generateToken());

		await auth.deleteExpiredSessions(now);

		const deletedSession = await repo.session.readByID(expiredSession.id);
		expect(deletedSession).toBeUndefined();

		const preservedSession = await repo.session.readByID(validSession.id);
		expect(preservedSession).toBeDefined();
		expect(preservedSession?.id).toEqual(validSession.id);
	});
});
