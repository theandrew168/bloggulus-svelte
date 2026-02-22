import { SQL } from "sql-template-strings";

import { Meta } from "$lib/server/meta";
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

function rowToTag(row: TagRow): Tag {
	const meta = Meta.load({
		createdAt: row.meta_created_at,
		updatedAt: row.meta_updated_at,
		version: row.meta_version,
	});

	return Tag.load({
		id: row.id,
		name: row.name,
		meta,
	});
}

export class TagRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(tag: Tag): Promise<void> {
		await this._conn.query(SQL`
			INSERT INTO tag
                (id, name, meta_created_at, meta_updated_at, meta_version)
            VALUES (
				${tag.id},
				${tag.name},
				${tag.meta.createdAt},
				${tag.meta.updatedAt},
				${tag.meta.version}
			);
		`);
	}

	async readByID(id: UUID): Promise<Tag | undefined> {
		const { rows } = await this._conn.query<TagRow>(SQL`
            SELECT
                id,
                name,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM tag
            WHERE id = ${id};
        `);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return rowToTag(row);
	}

	async readByName(name: string): Promise<Tag | undefined> {
		const { rows } = await this._conn.query<TagRow>(SQL`
            SELECT
                id,
                name,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM tag
            WHERE name = ${name};
        `);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return rowToTag(row);
	}

	async delete(tag: Tag): Promise<void> {
		await this._conn.query(SQL`
			DELETE
			FROM tag
			WHERE id = ${tag.id};
		`);
	}
}
