import { SQL } from "sql-template-strings";

import { Meta } from "$lib/server/meta";
import { Connection } from "$lib/server/postgres";
import { Session } from "$lib/server/session";
import { sha256 } from "$lib/server/utils";
import type { UUID } from "$lib/types";

type SessionRow = {
	id: UUID;
	account_id: UUID;
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
		expiresAt: row.expires_at,
		meta,
	});
}

export class SessionRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(session: Session, token: string): Promise<void> {
		const tokenHash = await sha256(token);
		await this._conn.query(SQL`
			INSERT INTO session
                (id, account_id, expires_at, token_hash, meta_created_at, meta_updated_at, meta_version)
            VALUES (
				${session.id},
				${session.accountID},
				${session.expiresAt},
				${tokenHash},
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

	async readByToken(token: string): Promise<Session | undefined> {
		const tokenHash = await sha256(token);
		const { rows } = await this._conn.query<SessionRow>(SQL`
            SELECT
                id,
                account_id,
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
