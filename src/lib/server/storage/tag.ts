import type postgres from "postgres";

import type { Tag } from "$lib/types";

export type CreateTagParams = {
	name: string;
};

const columns = ["id", "name"];

export type TagStorage = {
	create: (params: CreateTagParams) => Promise<Tag>;
	list: () => Promise<Tag[]>;
	readById: (id: string) => Promise<Tag | undefined>;
	delete: (tag: Tag) => Promise<void>;
};

export class PostgresTagStorage {
	private sql: postgres.Sql;

	constructor(sql: postgres.Sql) {
		this.sql = sql;
	}

	async create(params: CreateTagParams): Promise<Tag> {
		const created = await this.sql<Tag[]>`
			INSERT INTO tag ${this.sql(params)}
			RETURNING ${this.sql(columns)}
		`;
		return created[0];
	}

	async list(): Promise<Tag[]> {
		const tags = await this.sql<Tag[]>`
			SELECT ${this.sql(columns)}
			FROM tag
			ORDER BY name ASC
		`;
		return tags;
	}

	async readById(id: string): Promise<Tag | undefined> {
		const tags = await this.sql<Tag[]>`
			SELECT ${this.sql(columns)}
			FROM tag
			WHERE id = ${id}
		`;
		if (tags.length !== 1) {
			return undefined;
		}
		return tags[0];
	}

	async delete(tag: Tag) {
		await this.sql`
			DELETE
			FROM tag
			WHERE id = ${tag.id}
		`;
	}
}
