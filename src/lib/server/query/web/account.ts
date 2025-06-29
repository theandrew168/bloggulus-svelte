import type { Account } from "$lib/types";

export type AccountWebQuery = {
	// Powers authentication middleware.
	readBySessionToken: (sessionToken: string) => Promise<Account | undefined>;
	// Powers the accounts page (admin only).
	list: () => Promise<Account[]>;
};
