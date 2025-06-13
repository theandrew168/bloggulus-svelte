import type { UUID } from "node:crypto";

import { Blog } from "$lib/server/blog";
import { Connection } from "$lib/server/postgres";
import type { BlogRepository } from "$lib/server/repository/blog";

type BlogRow = {
	id: UUID;
	feed_url: string;
	site_url: string;
	title: string;
	etag: string | null;
	last_modified: string | null;
	synced_at: string | null;
	created_at: Date;
	updated_at: Date;
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

	async create(blog: Blog): Promise<void> {
		await this._conn.sql`
			INSERT INTO blog
                (id, feed_url, site_url, title, etag, last_modified, synced_at)
            VALUES (
                ${blog.id},
                ${blog.feedURL},
                ${blog.siteURL},
                ${blog.title},
                ${blog.etag ?? null},
                ${blog.lastModified ?? null},
                ${blog.syncedAt ?? null}
            );
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
                synced_at,
				created_at,
				updated_at
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
			createdAt: row.created_at,
			updatedAt: row.updated_at,
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
                synced_at,
				created_at,
				updated_at
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
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}

	async list(): Promise<Blog[]> {
		const rows = await this._conn.sql<BlogRow[]>`
            SELECT
                id,
                feed_url,
                site_url,
                title,
                etag,
                last_modified,
                synced_at,
				created_at,
				updated_at
            FROM blog;
        `;
		return rows.map((row) =>
			Blog.load({
				id: row.id,
				feedURL: row.feed_url,
				siteURL: row.site_url,
				title: row.title,
				etag: row.etag ?? undefined,
				lastModified: row.last_modified ?? undefined,
				syncedAt: row.synced_at ? new Date(row.synced_at) : undefined,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			}),
		);
	}

	async update(blog: Blog): Promise<void> {
		// TODO: Compare updated_at to catch race conditions.
		await this._conn.sql`
			UPDATE blog
			SET
				feed_url = ${blog.feedURL},
				site_url = ${blog.siteURL},
				title = ${blog.title},
				etag = ${blog.etag ?? null},
				last_modified = ${blog.lastModified ?? null},
				synced_at = ${blog.syncedAt ?? null}
			WHERE id = ${blog.id};
		`;
	}

	async delete(blog: Blog): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM blog
			WHERE id = ${blog.id};
		`;
	}
}
