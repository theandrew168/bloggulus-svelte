import { Connection } from "$lib/server/postgres";
import type { SessionRepository } from "$lib/server/repository/session";
import { Session } from "$lib/server/session";
import { sha256 } from "$lib/server/utils";
import type { UUID } from "$lib/types";

type SessionRow = {
	id: UUID;
	account_id: UUID;
	expires_at: Date;
	created_at: Date;
	updated_at: Date;
};

export class PostgresSessionRepository implements SessionRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(session: Session, token: string): Promise<void> {
		const tokenHash = await sha256(token);
		await this._conn.sql`
			INSERT INTO session
                (id, account_id, expires_at, token_hash, created_at, updated_at)
            VALUES (
				${session.id},
				${session.accountID},
				${session.expiresAt},
				${tokenHash},
				${session.createdAt},
				${session.updatedAt}
			);
		`;
	}

	async readByID(id: UUID): Promise<Session | undefined> {
		const rows = await this._conn.sql<SessionRow[]>`
            SELECT
                id,
                account_id,
                expires_at,
				created_at,
				updated_at
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
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}

	async readByToken(token: string): Promise<Session | undefined> {
		const tokenHash = await sha256(token);
		const rows = await this._conn.sql<SessionRow[]>`
            SELECT
                id,
                account_id,
                expires_at,
				created_at,
				updated_at
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
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}

	async listExpired(now: Date): Promise<Session[]> {
		const rows = await this._conn.sql<SessionRow[]>`
            SELECT
                id,
                account_id,
                expires_at,
				created_at,
				updated_at
            FROM session
            WHERE expires_at <= ${now};
        `;

		return rows.map((row) =>
			Session.load({
				id: row.id,
				accountID: row.account_id,
				expiresAt: row.expires_at,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
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
