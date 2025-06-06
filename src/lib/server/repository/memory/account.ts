import type { UUID } from "node:crypto";

import type { Account } from "$lib/server/account";
import type { AccountRepository } from "$lib/server/repository/account";

export class MemoryAccountRepository implements AccountRepository {
	private static _instance?: MemoryAccountRepository;
	private _db: Map<UUID, Account>;

	constructor() {
		this._db = new Map();
	}

	static getInstance(): MemoryAccountRepository {
		if (!this._instance) {
			this._instance = new MemoryAccountRepository();
		}

		return this._instance;
	}

	async readByID(id: UUID): Promise<Account | undefined> {
		return this._db.get(id);
	}

	async readByUsername(username: string): Promise<Account | undefined> {
		return this._db.values().find((account) => account.username === username);
	}

	async createOrUpdate(account: Account): Promise<void> {
		this._db.set(account.id, account);
	}

	async delete(account: Account): Promise<void> {
		this._db.delete(account.id);
	}
}
