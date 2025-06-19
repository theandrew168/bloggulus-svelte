import type { UUID } from "$lib/types";

import type { Account } from "../account";

export type AccountRepository = {
	create: (account: Account) => Promise<void>;
	readByID: (id: UUID) => Promise<Account | undefined>;
	readByUsername: (username: string) => Promise<Account | undefined>;
	update: (account: Account) => Promise<void>;
	delete: (account: Account) => Promise<void>;
};
