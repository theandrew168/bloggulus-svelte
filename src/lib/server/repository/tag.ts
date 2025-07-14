import { Connection } from "$lib/server/postgres";
import { Tag } from "$lib/server/tag";
import type { UUID } from "$lib/types";

type TagRow = {
	id: UUID;
	name: string;
	meta_created_at: Date;
	meta_updated_at: Date;
	meta_version: number;
};

export class TagRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(tag: Tag): Promise<void> {
		await this._conn.sql`
			INSERT INTO tag
                (id, name, meta_created_at, meta_updated_at, meta_version)
            VALUES (
				${tag.id},
				${tag.name},
				${tag.metaCreatedAt},
				${tag.metaUpdatedAt},
				${tag.metaVersion}
			);
		`;
	}

	async readByID(id: UUID): Promise<Tag | undefined> {
		const rows = await this._conn.sql<TagRow[]>`
            SELECT
                id,
                name,
				meta_created_at,
				meta_updated_at,
				meta_version
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
			metaCreatedAt: row.meta_created_at,
			metaUpdatedAt: row.meta_updated_at,
			metaVersion: row.meta_version,
		});
	}

	async readByName(name: string): Promise<Tag | undefined> {
		const rows = await this._conn.sql<TagRow[]>`
            SELECT
                id,
                name,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM tag
            WHERE name = ${name};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Tag.load({
			id: row.id,
			name: row.name,
			metaCreatedAt: row.meta_created_at,
			metaUpdatedAt: row.meta_updated_at,
			metaVersion: row.meta_version,
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
