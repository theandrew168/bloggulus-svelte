import type { UUID } from "crypto";

import { SQL } from "sql-template-strings";

import { Connection } from "$lib/server/postgres";
import type { PostDetails } from "$lib/types";

type PostDetailsRow = {
	id: UUID;
	blog_id: UUID;
	url: string;
	title: string;
	published_at: Date;
};

export class PostWebQuery {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	// Powers the post details page (admin only).
	async readDetailsByID(postID: UUID): Promise<PostDetails | undefined> {
		const { rows } = await this._conn.query<PostDetailsRow>(SQL`
            SELECT
                post.id,
                post.blog_id,
                post.url,
                post.title,
                post.published_at
            FROM post
            WHERE post.id = ${postID};
        `);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return {
			id: row.id,
			blogID: row.blog_id,
			url: new URL(row.url),
			title: row.title,
			publishedAt: row.published_at,
		};
	}

	// Powers the blog details page (admin only).
	async listDetailsByBlogID(blogID: UUID): Promise<PostDetails[]> {
		const { rows } = await this._conn.query<PostDetailsRow>(SQL`
            SELECT
                post.id,
                post.blog_id,
                post.url,
                post.title,
                post.published_at
            FROM post
            WHERE post.blog_id = ${blogID}
            ORDER BY post.published_at DESC;
        `);

		return rows.map((row) => ({
			id: row.id,
			blogID: row.blog_id,
			url: new URL(row.url),
			title: row.title,
			publishedAt: row.published_at,
		}));
	}
}
