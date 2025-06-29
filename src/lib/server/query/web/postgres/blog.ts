import type { UUID } from "crypto";

import { Connection } from "$lib/server/postgres";
import type { BlogWebQuery } from "$lib/server/query/web/blog";
import type { Account, Blog, BlogDetails } from "$lib/types";

type BlogRow = {
	id: UUID;
	title: string;
	site_url: string;
	is_followed: boolean;
};

type BlogDetailsRow = {
	id: UUID;
	feed_url: string;
	site_url: string;
	title: string;
	synced_at: Date;
};

export class PostgresBlogWebQuery implements BlogWebQuery {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async readDetailsByID(blogID: UUID): Promise<BlogDetails | undefined> {
		const rows = await this._conn.sql<BlogDetailsRow[]>`
            SELECT
                blog.id,
                blog.feed_url,
                blog.site_url,
                blog.title,
                blog.synced_at
            FROM blog
            WHERE blog.id = ${blogID};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return {
			id: row.id,
			feedURL: row.feed_url,
			siteURL: row.site_url,
			title: row.title,
			syncedAt: row.synced_at,
		};
	}

	async readDetailsByFeedURL(feedURL: string): Promise<BlogDetails | undefined> {
		const rows = await this._conn.sql<BlogDetailsRow[]>`
            SELECT
                blog.id,
                blog.feed_url,
                blog.site_url,
                blog.title,
                blog.synced_at
            FROM blog
            WHERE blog.feed_url = ${feedURL};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return {
			id: row.id,
			feedURL: row.feed_url,
			siteURL: row.site_url,
			title: row.title,
			syncedAt: row.synced_at,
		};
	}

	async list(account: Account): Promise<Blog[]> {
		const rows = await this._conn.sql<BlogRow[]>`
            SELECT
                blog.id,
                blog.title,
                blog.site_url,
                account_blog.account_id IS NOT NULL AS is_followed
            FROM blog
            LEFT JOIN account_blog
                ON account_blog.blog_id = blog.id
                AND account_blog.account_id = ${account.id};
        `;

		return rows.map((row) => ({
			id: row.id,
			title: row.title,
			siteURL: row.site_url,
			isFollowed: row.is_followed,
		}));
	}
}
