import { Connection } from "$lib/server/postgres";
import { Tag } from "$lib/server/tag";
import type { UUID } from "$lib/types";

type TagRow = {
	id: UUID;
	name: string;
	created_at: Date;
	updated_at: Date;
	update_version: number;
};

export class TagRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(tag: Tag): Promise<void> {
		await this._conn.sql`
			INSERT INTO tag
                (id, name, created_at, updated_at, update_version)
            VALUES (
				${tag.id},
				${tag.name},
				${tag.createdAt},
				${tag.updatedAt},
				${tag.updateVersion}
			);
		`;
	}

	async readByID(id: UUID): Promise<Tag | undefined> {
		const rows = await this._conn.sql<TagRow[]>`
            SELECT
                id,
                name,
				created_at,
				updated_at,
				update_version
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
			updateVersion: row.update_version,
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
