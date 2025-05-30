import type { UUID } from "node:crypto";

import type { Account } from "$lib/server/domain/account";
import type { AccountRepository } from "$lib/server/domain/repository";

export class MemoryAccountRepository implements AccountRepository {
	async readByID(id: UUID): Promise<Account | undefined> {
		return undefined;
	}

	async readByUsername(username: string): Promise<Account | undefined> {
		return undefined;
	}

	async readBySessionToken(sessionToken: string): Promise<Account | undefined> {
		return undefined;
	}

	async createOrUpdate(account: Account): Promise<void> {}

	async delete(account: Account): Promise<void> {}
}
