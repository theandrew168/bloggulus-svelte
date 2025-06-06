import type { UUID } from "node:crypto";

import type { Account } from "../account";

export type AccountRepository = {
	readByID: (id: UUID) => Promise<Account | undefined>;
	readByUsername: (username: string) => Promise<Account | undefined>;
	createOrUpdate: (account: Account) => Promise<void>;
	delete: (account: Account) => Promise<void>;
};
