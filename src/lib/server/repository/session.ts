import { SQL } from "sql-template-strings";

import { Meta } from "$lib/server/meta";
import { Connection } from "$lib/server/postgres";
import { Session } from "$lib/server/session";
import type { UUID } from "$lib/types";

type SessionRow = {
	id: UUID;
	account_id: UUID;
	token_hash: string;
	expires_at: Date;
	meta_created_at: Date;
	meta_updated_at: Date;
	meta_version: number;
};

function rowToSession(row: SessionRow): Session {
	const meta = Meta.load({
		createdAt: row.meta_created_at,
		updatedAt: row.meta_updated_at,
		version: row.meta_version,
	});

	return Session.load({
		id: row.id,
		accountID: row.account_id,
		tokenHash: row.token_hash,
		expiresAt: row.expires_at,
		meta,
	});
}

export class SessionRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(session: Session): Promise<void> {
		await this._conn.query(SQL`
			INSERT INTO session
                (id, account_id, token_hash, expires_at, meta_created_at, meta_updated_at, meta_version)
            VALUES (
				${session.id},
				${session.accountID},
				${session.tokenHash},
				${session.expiresAt},
				${session.meta.createdAt},
				${session.meta.updatedAt},
				${session.meta.version}
			);
		`);
	}

	async readByID(id: UUID): Promise<Session | undefined> {
		const { rows } = await this._conn.query<SessionRow>(SQL`
            SELECT
                id,
                account_id,
				token_hash,
                expires_at,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM session
            WHERE id = ${id};
        `);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return rowToSession(row);
	}

	async readByTokenHash(tokenHash: string): Promise<Session | undefined> {
		const { rows } = await this._conn.query<SessionRow>(SQL`
            SELECT
                id,
                account_id,
				token_hash,
                expires_at,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM session
            WHERE token_hash = ${tokenHash};
        `);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return rowToSession(row);
	}

	// Used for deleting expired sessions.
	async listExpired(now: Date): Promise<Session[]> {
		const { rows } = await this._conn.query<SessionRow>(SQL`
            SELECT
                id,
                account_id,
				token_hash,
                expires_at,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM session
            WHERE expires_at <= ${now};
        `);

		return rows.map(rowToSession);
	}

	async delete(session: Session): Promise<void> {
		await this._conn.query(SQL`
			DELETE
			FROM session
			WHERE id = ${session.id};
		`);
	}
}
