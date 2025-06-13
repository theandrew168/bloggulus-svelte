import type { UUID } from "node:crypto";

import { Post } from "$lib/server/post";
import { Connection } from "$lib/server/postgres";
import type { PostRepository } from "$lib/server/repository/post";

type PostRow = {
	id: UUID;
	blog_id: UUID;
	url: string;
	title: string;
	published_at: string;
	content: string | null;
	created_at: Date;
	updated_at: Date;
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

	async create(post: Post): Promise<void> {
		await this._conn.sql`
			INSERT INTO post
                (id, blog_id, url, title, published_at, content)
            VALUES (
                ${post.id},
                ${post.blogID},
                ${post.url},
                ${post.title},
                ${post.publishedAt},
                ${post.content ?? null}
            );
		`;
	}

	async readByID(id: UUID): Promise<Post | undefined> {
		const rows = await this._conn.sql<PostRow[]>`
            SELECT
                id,
                blog_id,
                url,
                title,
                published_at,
                content,
				created_at,
				updated_at
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
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}

	async listByBlogID(blogID: UUID): Promise<Post[]> {
		const rows = await this._conn.sql<PostRow[]>`
            SELECT
                id,
                blog_id,
                url,
                title,
                published_at,
                content,
				created_at,
				updated_at
            FROM post
            WHERE blog_id = ${blogID};
        `;
		return rows.map((row) =>
			Post.load({
				id: row.id,
				blogID: row.blog_id,
				url: row.url,
				title: row.title,
				publishedAt: new Date(row.published_at),
				content: row.content ?? undefined,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			}),
		);
	}

	async update(post: Post): Promise<void> {
		// TODO: Compare updated_at to catch race conditions.
		await this._conn.sql`
			UPDATE post
			SET
				blog_id = ${post.blogID},
				url = ${post.url},
				title = ${post.title},
				published_at = ${post.publishedAt},
				content = ${post.content ?? null}
			WHERE id = ${post.id};
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
