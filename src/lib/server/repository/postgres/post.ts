import type { UUID } from "node:crypto";

import { Post } from "$lib/server/domain/post";
import type { PostRepository } from "$lib/server/domain/repository/post";
import { Connection } from "$lib/server/postgres/connection";

type PostRow = {
	id: UUID;
	blog_id: UUID;
	url: string;
	title: string;
	published_at: string;
	content: string | null;
};

export class PostgresPostRepository implements PostRepository {
	private static _instance?: PostgresPostRepository;
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	static getInstance(): PostgresPostRepository {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new PostgresPostRepository(conn);
		}

		return this._instance;
	}

	async readByID(id: UUID): Promise<Post | undefined> {
		const rows = await this._conn.sql<PostRow[]>`
            SELECT
                id,
                blog_id,
                url,
                title,
                published_at,
                content
            FROM post
            WHERE id = ${id};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Post.load({
			id: row.id,
			blogID: row.blog_id,
			url: row.url,
			title: row.title,
			publishedAt: new Date(row.published_at),
			content: row.content ?? undefined,
		});
	}

	async createOrUpdate(post: Post): Promise<void> {
		await this._conn.sql`
			INSERT INTO post
                (id, blog_id, url, title, published_at, content)
            VALUES (
                ${post.id},
                ${post.blogID},
                ${post.url.toString()},
                ${post.title},
                ${post.publishedAt.toISOString()},
                ${post.content ?? null}
            )
            ON CONFLICT (id)
			DO UPDATE SET
				blog_id = EXCLUDED.blog_id,
                url = EXCLUDED.url,
                title = EXCLUDED.title,
                published_at = EXCLUDED.published_at,
                content = EXCLUDED.content;
		`;
	}

	async delete(post: Post): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM post
			WHERE id = ${post.id};
		`;
	}
}
