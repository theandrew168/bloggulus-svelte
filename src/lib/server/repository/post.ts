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
	meta_created_at: Date;
	meta_updated_at: Date;
	meta_version: number;
};

export class PostRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(post: Post): Promise<void> {
		await this._conn.sql`
			INSERT INTO post
                (id, blog_id, url, title, published_at, content, meta_created_at, meta_updated_at, meta_version)
            VALUES (
                ${post.id},
                ${post.blogID},
                ${post.url.toString()},
                ${post.title},
                ${post.publishedAt},
                ${post.content ?? null},
				${post.metaCreatedAt},
				${post.metaUpdatedAt},
				${post.metaVersion}
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
				meta_created_at,
				meta_updated_at,
				meta_version
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
			metaCreatedAt: row.meta_created_at,
			metaUpdatedAt: row.meta_updated_at,
			metaVersion: row.meta_version,
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
				meta_created_at,
				meta_updated_at,
				meta_version
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
				metaCreatedAt: row.meta_created_at,
				metaUpdatedAt: row.meta_updated_at,
				metaVersion: row.meta_version,
			}),
		);
	}

	async update(post: Post): Promise<void> {
		const newUpdatedAt = new Date();
		const newVersion = post.metaVersion + 1;

		const rows = await this._conn.sql`
			UPDATE post
			SET
				blog_id = ${post.blogID},
				url = ${post.url.toString()},
				title = ${post.title},
				published_at = ${post.publishedAt},
				content = ${post.content ?? null},
				meta_updated_at = ${newUpdatedAt},
				meta_version = ${newVersion}
			WHERE id = ${post.id}
				AND meta_version = ${post.metaVersion}
			RETURNING id;
		`;

		if (rows.length !== 1) {
			throw new ConcurrentUpdateError("Post", post.id);
		}

		post.metaUpdatedAt = newUpdatedAt;
		post.metaVersion = newVersion;
	}

	async delete(post: Post): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM post
			WHERE id = ${post.id};
		`;
	}
}
