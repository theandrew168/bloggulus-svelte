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

export class SessionRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(session: Session, token: string): Promise<void> {
		const tokenHash = await sha256(token);
		await this._conn.sql`
			INSERT INTO session
                (id, account_id, expires_at, token_hash, meta_created_at, meta_updated_at, meta_version)
            VALUES (
				${session.id},
				${session.accountID},
				${session.expiresAt},
				${tokenHash},
				${session.metaCreatedAt},
				${session.metaUpdatedAt},
				${session.metaVersion}
			);
		`;
	}

	async readByID(id: UUID): Promise<Session | undefined> {
		const rows = await this._conn.sql<SessionRow[]>`
            SELECT
                id,
                account_id,
                expires_at,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM session
            WHERE id = ${id};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Session.load({
			id: row.id,
			accountID: row.account_id,
			expiresAt: row.expires_at,
			metaCreatedAt: row.meta_created_at,
			metaUpdatedAt: row.meta_updated_at,
			metaVersion: row.meta_version,
		});
	}

	async readByToken(token: string): Promise<Session | undefined> {
		const tokenHash = await sha256(token);
		const rows = await this._conn.sql<SessionRow[]>`
            SELECT
                id,
                account_id,
                expires_at,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM session
            WHERE token_hash = ${tokenHash};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Session.load({
			id: row.id,
			accountID: row.account_id,
			expiresAt: row.expires_at,
			metaCreatedAt: row.meta_created_at,
			metaUpdatedAt: row.meta_updated_at,
			metaVersion: row.meta_version,
		});
	}

	// Used for deleting expired sessions.
	async listExpired(now: Date): Promise<Session[]> {
		const rows = await this._conn.sql<SessionRow[]>`
            SELECT
                id,
                account_id,
                expires_at,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM session
            WHERE expires_at <= ${now};
        `;

		return rows.map((row) =>
			Session.load({
				id: row.id,
				accountID: row.account_id,
				expiresAt: row.expires_at,
				metaCreatedAt: row.meta_created_at,
				metaUpdatedAt: row.meta_updated_at,
				metaVersion: row.meta_version,
			}),
		);
	}

	async delete(session: Session): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM session
			WHERE id = ${session.id};
		`;
	}
}
