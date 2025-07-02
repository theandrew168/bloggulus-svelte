import { Post } from "$lib/server/post";
import { Connection } from "$lib/server/postgres";
import type { UUID } from "$lib/types";

import { ConcurrentUpdateError } from "./errors";

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

export class PostRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(post: Post): Promise<void> {
		await this._conn.sql`
			INSERT INTO post
                (id, blog_id, url, title, published_at, content, created_at, updated_at)
            VALUES (
                ${post.id},
                ${post.blogID},
                ${post.url.toString()},
                ${post.title},
                ${post.publishedAt},
                ${post.content ?? null},
				${post.createdAt},
				${post.updatedAt}
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
			url: new URL(row.url),
			title: row.title,
			publishedAt: new Date(row.published_at),
			content: row.content ?? undefined,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}

	// Used for syncing a blog's posts.
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
				url: new URL(row.url),
				title: row.title,
				publishedAt: new Date(row.published_at),
				content: row.content ?? undefined,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			}),
		);
	}

	async update(post: Post): Promise<void> {
		const now = new Date();
		const rows = await this._conn.sql`
			UPDATE post
			SET
				blog_id = ${post.blogID},
				url = ${post.url.toString()},
				title = ${post.title},
				published_at = ${post.publishedAt},
				content = ${post.content ?? null},
				updated_at = ${now}
			WHERE id = ${post.id}
				AND updated_at = ${post.updatedAt}
			RETURNING id;
		`;

		if (rows.length !== 1) {
			throw new ConcurrentUpdateError("Post", post.id);
		}

		post.updatedAt = now;
	}

	async delete(post: Post): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM post
			WHERE id = ${post.id};
		`;
	}
}
