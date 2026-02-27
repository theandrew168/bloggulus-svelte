import { SQL } from "sql-template-strings";

import { Meta } from "$lib/server/meta";
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

function rowToPost(row: PostRow): Post {
	const meta = Meta.load({
		createdAt: row.meta_created_at,
		updatedAt: row.meta_updated_at,
		version: row.meta_version,
	});

	return Post.load({
		id: row.id,
		blogID: row.blog_id,
		url: new URL(row.url),
		title: row.title,
		publishedAt: new Date(row.published_at),
		content: row.content ?? undefined,
		meta,
	});
}

export class PostRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(post: Post): Promise<void> {
		await this._conn.query(SQL`
			INSERT INTO post
                (id, blog_id, url, title, published_at, content, meta_created_at, meta_updated_at, meta_version)
            VALUES (
                ${post.id},
                ${post.blogID},
                ${post.url.toString()},
                ${post.title},
                ${post.publishedAt},
                ${post.content ?? null},
				${post.meta.createdAt},
				${post.meta.updatedAt},
				${post.meta.version}
            );
		`);
	}

	async readByID(id: UUID): Promise<Post | undefined> {
		const { rows } = await this._conn.query<PostRow>(SQL`
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
        `);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return rowToPost(row);
	}

	// Used for syncing a blog's posts.
	async listByBlogID(blogID: UUID): Promise<Post[]> {
		const { rows } = await this._conn.query<PostRow>(SQL`
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
        `);
		return rows.map(rowToPost);
	}

	async update(post: Post): Promise<void> {
		const newUpdatedAt = new Date();
		const newVersion = post.meta.version + 1;

		const { rows } = await this._conn.query(SQL`
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
				AND meta_version = ${post.meta.version}
			RETURNING id;
		`);

		if (rows.length !== 1) {
			throw new ConcurrentUpdateError("Concurrent update detected", "Post", "id", post.id);
		}

		post.meta.updatedAt = newUpdatedAt;
		post.meta.version = newVersion;
	}

	async delete(post: Post): Promise<void> {
		await this._conn.query(SQL`
			DELETE
			FROM post
			WHERE id = ${post.id};
		`);
	}
}
