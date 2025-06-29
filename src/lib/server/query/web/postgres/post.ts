import type { UUID } from "crypto";

import { Connection } from "$lib/server/postgres";
import type { PostWebQuery } from "$lib/server/query/web/post";
import type { PostDetails } from "$lib/types";

type PostDetailsRow = {
	id: UUID;
	blog_id: UUID;
	url: string;
	title: string;
	published_at: Date;
};

export class PostgresPostWebQuery implements PostWebQuery {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async readDetailsByID(postID: UUID): Promise<PostDetails | undefined> {
		const rows = await this._conn.sql<PostDetailsRow[]>`
            SELECT
                post.id,
                post.blog_id,
                post.url,
                post.title,
                post.published_at
            FROM post
            WHERE post.id = ${postID};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return {
			id: row.id,
			blogID: row.blog_id,
			url: row.url,
			title: row.title,
			publishedAt: row.published_at,
		};
	}

	async listDetailsByBlogID(blogID: UUID): Promise<PostDetails[]> {
		const rows = await this._conn.sql<PostDetailsRow[]>`
            SELECT
                post.id,
                post.blog_id,
                post.url,
                post.title,
                post.published_at
            FROM post
            WHERE post.blog_id = ${blogID};
        `;

		return rows.map((row) => ({
			id: row.id,
			blogID: row.blog_id,
			url: row.url,
			title: row.title,
			publishedAt: row.published_at,
		}));
	}
}
