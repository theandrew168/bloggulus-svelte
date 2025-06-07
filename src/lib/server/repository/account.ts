import type { UUID } from "node:crypto";

import type { Account } from "../account";

export type AccountRepository = {
	createOrUpdate: (account: Account) => Promise<void>;
	readByID: (id: UUID) => Promise<Account | undefined>;
	readByUsername: (username: string) => Promise<Account | undefined>;
	delete: (account: Account) => Promise<void>;
};
