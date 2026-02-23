import { describe, expect, it } from "vitest";

import { Account } from "$lib/server/account";
import { Repository } from "$lib/server/repository";
import { generateSessionToken, Session } from "$lib/server/session";
import { randomAccountParams, randomSessionParams } from "$lib/server/test";
import { sha256 } from "$lib/server/utils";

import { WebQuery } from ".";

describe("query/web/account", () => {
	const repo = Repository.getInstance();

	const query = WebQuery.getInstance();

	describe("readBySessionTokenHash", () => {
		it("should read an account by session token", async () => {
			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			const session = new Session(randomSessionParams(account));
			await repo.session.create(session);

			const accountBySessionTokenHash = await query.account.readBySessionTokenHash(session.tokenHash);
			expect(accountBySessionTokenHash).toBeDefined();
			expect(accountBySessionTokenHash?.id).toEqual(account.id);
			expect(accountBySessionTokenHash?.username).toEqual(account.username);
			expect(accountBySessionTokenHash?.isAdmin).toEqual(account.isAdmin);
		});

		it("should return undefined for invalid session tokens", async () => {
			const invalidSessionTokenHash = sha256(generateSessionToken());

			const accountBySessionTokenHash = await query.account.readBySessionTokenHash(invalidSessionTokenHash);
			expect(accountBySessionTokenHash).toBeUndefined();
		});
	});

	describe("list", () => {
		it("should list all accounts", async () => {
			const account1 = new Account(randomAccountParams());
			await repo.account.create(account1);

			const account2 = new Account(randomAccountParams());
			await repo.account.create(account2);

			const accounts = await query.account.list();

			const listedAccount1 = accounts.find((account) => account.id === account1.id);
			expect(listedAccount1).toBeDefined();
			expect(listedAccount1?.username).toEqual(account1.username);
			expect(listedAccount1?.isAdmin).toEqual(account1.isAdmin);

			const listedAccount2 = accounts.find((account) => account.id === account2.id);
			expect(listedAccount2).toBeDefined();
			expect(listedAccount2?.username).toEqual(account2.username);
			expect(listedAccount2?.isAdmin).toEqual(account2.isAdmin);
		});
	});
});
