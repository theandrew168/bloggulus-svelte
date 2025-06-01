import { createHash, type UUID } from "node:crypto";

import type { SessionRepository } from "$lib/server/domain/repository";
import { Session, sha256 } from "$lib/server/domain/session";
import { Connection } from "$lib/server/postgres/connection";

type SessionRow = {
	id: UUID;
	account_id: UUID;
	expires_at: Date;
};

export class PostgresSessionRepository implements SessionRepository {
	private static _instance?: PostgresSessionRepository;
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	static getInstance(): PostgresSessionRepository {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new PostgresSessionRepository(conn);
		}

		return this._instance;
	}

	async readByID(id: UUID): Promise<Session | undefined> {
		const rows = await this._conn.sql<SessionRow[]>`
            SELECT
                id,
                account_id,
                expires_at
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
		});
	}

	async readByToken(token: string): Promise<Session | undefined> {
		const hash = sha256(token);
		const rows = await this._conn.sql<SessionRow[]>`
            SELECT
                id,
                account_id,
                expires_at
            FROM session
            WHERE hash = ${hash};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Session.load({
			id: row.id,
			accountID: row.account_id,
			expiresAt: row.expires_at,
		});
	}

	async createOrUpdate(session: Session, token: string): Promise<void> {
		const hash = sha256(token);
		await this._conn.sql`
			INSERT INTO session
                (id, account_id, expires_at, hash)
            VALUES (
				${session.id},
				${session.accountID},
				${session.expiresAt},
				${hash}
			)
		`;
	}

	async delete(session: Session): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM session
			WHERE id = ${session.id};
		`;
	}
}
