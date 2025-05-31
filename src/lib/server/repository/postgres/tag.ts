import type { UUID } from "node:crypto";

import type { TagRepository } from "$lib/server/domain/repository";
import { Tag } from "$lib/server/domain/tag";
import { Connection } from "$lib/server/postgres/connection";

type TagRow = {
	id: UUID;
	name: string;
};

export class PostgresTagRepository implements TagRepository {
	private static _instance?: PostgresTagRepository;
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	static getInstance(): PostgresTagRepository {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new PostgresTagRepository(conn);
		}

		return this._instance;
	}

	async readByID(id: UUID): Promise<Tag | undefined> {
		const rows = await this._conn.sql<TagRow[]>`
            SELECT
                id,
                name
            FROM tag
            WHERE id = ${id};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Tag.load({
			id: row.id,
			name: row.name,
		});
	}

	async createOrUpdate(tag: Tag): Promise<void> {
		await this._conn.sql`
			INSERT INTO tag
                (id, name)
            VALUES
                (${tag.id}, ${tag.name})
            ON CONFLICT (id)
            DO UPDATE SET
                name = EXCLUDED.name;
		`;
	}

	async delete(tag: Tag): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM tag
			WHERE id = ${tag.id};
		`;
	}
}
