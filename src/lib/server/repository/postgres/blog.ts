import type { UUID } from "node:crypto";

import { Blog } from "$lib/server/blog";
import { Connection } from "$lib/server/postgres/connection";
import type { BlogRepository } from "$lib/server/repository/blog";

type BlogRow = {
	id: UUID;
	feed_url: string;
	site_url: string;
	title: string;
	etag: string | null;
	last_modified: string | null;
	synced_at: string | null;
};

export class PostgresBlogRepository implements BlogRepository {
	private static _instance?: PostgresBlogRepository;
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	static getInstance(): PostgresBlogRepository {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new PostgresBlogRepository(conn);
		}

		return this._instance;
	}

	async createOrUpdate(blog: Blog): Promise<void> {
		await this._conn.sql`
			INSERT INTO blog
                (id, feed_url, site_url, title, etag, last_modified, synced_at)
            VALUES (
                ${blog.id},
                ${blog.feedURL.toString()},
                ${blog.siteURL.toString()},
                ${blog.title},
                ${blog.etag ?? null},
                ${blog.lastModified ?? null},
                ${blog.syncedAt?.toISOString() ?? null}
            )
            ON CONFLICT (id)
			DO UPDATE SET
				feed_url = EXCLUDED.feed_url,
                site_url = EXCLUDED.site_url,
                title = EXCLUDED.title,
                etag = EXCLUDED.etag,
                last_modified = EXCLUDED.last_modified,
                synced_at = EXCLUDED.synced_at;
		`;
	}

	async readByID(id: UUID): Promise<Blog | undefined> {
		const rows = await this._conn.sql<BlogRow[]>`
            SELECT
                id,
                feed_url,
                site_url,
                title,
                etag,
                last_modified,
                synced_at
            FROM blog
            WHERE id = ${id};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Blog.load({
			id: row.id,
			feedURL: row.feed_url,
			siteURL: row.site_url,
			title: row.title,
			etag: row.etag ?? undefined,
			lastModified: row.last_modified ?? undefined,
			syncedAt: row.synced_at ? new Date(row.synced_at) : undefined,
		});
	}

	async readByFeedURL(feedURL: string): Promise<Blog | undefined> {
		const rows = await this._conn.sql<BlogRow[]>`
            SELECT
                id,
                feed_url,
                site_url,
                title,
                etag,
                last_modified,
                synced_at
            FROM blog
            WHERE feed_url = ${feedURL};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Blog.load({
			id: row.id,
			feedURL: row.feed_url,
			siteURL: row.site_url,
			title: row.title,
			etag: row.etag ?? undefined,
			lastModified: row.last_modified ?? undefined,
			syncedAt: row.synced_at ? new Date(row.synced_at) : undefined,
		});
	}

	async delete(blog: Blog): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM blog
			WHERE id = ${blog.id};
		`;
	}
}
