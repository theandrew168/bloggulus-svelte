import type { UUID } from "crypto";

import { SQL } from "sql-template-strings";

import { Connection } from "$lib/server/postgres";
import type { Account, Blog, BlogDetails } from "$lib/types";

type BlogRow = {
	id: UUID;
	title: string;
	site_url: string;
	is_followed: boolean;
};

type BlogDetailsRow = {
	id: UUID;
	feed_url: URL;
	site_url: URL;
	title: string;
	synced_at: Date;
	is_public: boolean;
};

export class BlogWebQuery {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	// Powers the blog details page (admin only).
	async readDetailsByID(blogID: UUID): Promise<BlogDetails | undefined> {
		const { rows } = await this._conn.query<BlogDetailsRow>(SQL`
            SELECT
                blog.id,
                blog.feed_url,
                blog.site_url,
                blog.title,
                blog.synced_at,
				blog.is_public
            FROM blog
            WHERE blog.id = ${blogID};
        `);

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
			isPublic: row.is_public,
		};
	}

	// Powers the add / follow blogs page.
	async readDetailsByFeedURL(feedURL: string): Promise<BlogDetails | undefined> {
		const { rows } = await this._conn.query<BlogDetailsRow>(SQL`
            SELECT
                blog.id,
                blog.feed_url,
                blog.site_url,
                blog.title,
                blog.synced_at,
				blog.is_public
            FROM blog
            WHERE blog.feed_url = ${feedURL};
        `);

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
			isPublic: row.is_public,
		};
	}

	// Powers the add / follow blogs page (admins only).
	async listAll(account: Account): Promise<Blog[]> {
		const { rows } = await this._conn.query<BlogRow>(SQL`
            SELECT
                blog.id,
                blog.title,
                blog.site_url,
                account_blog.account_id IS NOT NULL AS is_followed
            FROM blog
            LEFT JOIN account_blog
                ON account_blog.blog_id = blog.id
                AND account_blog.account_id = ${account.id}
			ORDER BY blog.title ASC;
        `);

		return rows.map((row) => ({
			id: row.id,
			title: row.title,
			siteURL: new URL(row.site_url),
			isFollowed: row.is_followed,
		}));
	}

	// Powers the add / follow blogs page (non-admins, public and / or followed only).
	async listVisible(account: Account): Promise<Blog[]> {
		const { rows } = await this._conn.query<BlogRow>(SQL`
            SELECT
                blog.id,
                blog.title,
                blog.site_url,
                account_blog.account_id IS NOT NULL AS is_followed
            FROM blog
            LEFT JOIN account_blog
                ON account_blog.blog_id = blog.id
                AND account_blog.account_id = ${account.id}
			WHERE (blog.is_public = TRUE OR account_blog.blog_id IS NOT NULL)
			ORDER BY blog.title ASC;
        `);

		return rows.map((row) => ({
			id: row.id,
			title: row.title,
			siteURL: new URL(row.site_url),
			isFollowed: row.is_followed,
		}));
	}
}
