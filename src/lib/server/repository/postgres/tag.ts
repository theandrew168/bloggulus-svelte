import type { UUID } from "node:crypto";

import { Connection } from "$lib/server/postgres";
import type { TagRepository } from "$lib/server/repository/tag";
import { Tag } from "$lib/server/tag";

type TagRow = {
	id: UUID;
	name: string;
	created_at: Date;
	updated_at: Date;
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

	async create(tag: Tag): Promise<void> {
		await this._conn.sql`
			INSERT INTO tag
                (id, name)
            VALUES (
				${tag.id},
				${tag.name}
			);
		`;
	}

	async readByID(id: UUID): Promise<Tag | undefined> {
		const rows = await this._conn.sql<TagRow[]>`
            SELECT
                id,
                name,
				created_at,
				updated_at
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
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}
	async delete(tag: Tag): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM tag
			WHERE id = ${tag.id};
		`;
	}
}
