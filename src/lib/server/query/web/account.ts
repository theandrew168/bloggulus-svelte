import type { UUID } from "crypto";

import { Connection } from "$lib/server/postgres";
import { sha256 } from "$lib/server/utils";
import type { Account } from "$lib/types";

type AccountRow = {
	id: UUID;
	username: string;
	is_admin: boolean;
};

export class AccountWebQuery {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	// Powers authentication middleware.
	async readBySessionToken(sessionToken: string): Promise<Account | undefined> {
		const sessionTokenHash = await sha256(sessionToken);
		const rows = await this._conn.sql<AccountRow[]>`
            SELECT
                account.id,
                account.username,
                account.is_admin
            FROM account
            INNER JOIN session
                ON session.account_id = account.id
            WHERE session.token_hash = ${sessionTokenHash};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return {
			id: row.id,
			username: row.username,
			isAdmin: row.is_admin,
		};
	}

	// Powers the accounts page (admin only).
	async list(): Promise<Account[]> {
		const rows = await this._conn.sql<AccountRow[]>`
            SELECT
                account.id,
                account.username,
                account.is_admin
            FROM account;
        `;

		return rows.map((row) => ({
			id: row.id,
			username: row.username,
			isAdmin: row.is_admin,
		}));
	}
}
