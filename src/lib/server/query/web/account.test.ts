import Chance from "chance";
import { describe, expect, it } from "vitest";

import { Account } from "$lib/server/account";
import { Repository } from "$lib/server/repository";
import { generateSessionToken, Session } from "$lib/server/session";
import { randomAccountParams, randomSessionParams } from "$lib/server/test";

import { WebQuery } from ".";

describe("query/web/account", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();

	const query = WebQuery.getInstance();

	describe("readBySessionToken", () => {
		it("should read an account by session token", async () => {
			const account = new Account(randomAccountParams());
			await repo.account.create(account);

			const session = new Session(randomSessionParams(account));
			const token = generateSessionToken();
			await repo.session.create(session, token);

			const accountBySessionToken = await query.account.readBySessionToken(token);
			expect(accountBySessionToken).toBeDefined();
			expect(accountBySessionToken?.id).toEqual(account.id);
			expect(accountBySessionToken?.username).toEqual(account.username);
			expect(accountBySessionToken?.isAdmin).toEqual(account.isAdmin);
		});

		it("should return undefined for invalid session tokens", async () => {
			const invalidToken = generateSessionToken();

			const accountBySessionToken = await query.account.readBySessionToken(invalidToken);
			expect(accountBySessionToken).toBeUndefined();
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
