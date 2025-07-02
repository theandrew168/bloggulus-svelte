import { Blog } from "$lib/server/blog";
import { Connection } from "$lib/server/postgres";
import type { UUID } from "$lib/types";

import { ConcurrentUpdateError } from "./errors";

type BlogRow = {
	id: UUID;
	feed_url: string;
	site_url: string;
	title: string;
	synced_at: Date;
	etag: string | null;
	last_modified: string | null;
	created_at: Date;
	updated_at: Date;
};

export class BlogRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(blog: Blog): Promise<void> {
		await this._conn.sql`
			INSERT INTO blog
                (id, feed_url, site_url, title, synced_at, etag, last_modified, created_at, updated_at)
            VALUES (
                ${blog.id},
                ${blog.feedURL.toString()},
                ${blog.siteURL.toString()},
                ${blog.title},
                ${blog.syncedAt},
                ${blog.etag ?? null},
                ${blog.lastModified ?? null},
				${blog.createdAt},
				${blog.updatedAt}
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
                synced_at,
                etag,
                last_modified,
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
			feedURL: new URL(row.feed_url),
			siteURL: new URL(row.site_url),
			title: row.title,
			syncedAt: row.synced_at,
			etag: row.etag ?? undefined,
			lastModified: row.last_modified ?? undefined,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}

	async readByFeedURL(feedURL: URL): Promise<Blog | undefined> {
		const rows = await this._conn.sql<BlogRow[]>`
            SELECT
                id,
                feed_url,
                site_url,
                title,
                synced_at,
                etag,
                last_modified,
				created_at,
				updated_at
            FROM blog
            WHERE feed_url = ${feedURL.toString()};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Blog.load({
			id: row.id,
			feedURL: new URL(row.feed_url),
			siteURL: new URL(row.site_url),
			title: row.title,
			syncedAt: row.synced_at,
			etag: row.etag ?? undefined,
			lastModified: row.last_modified ?? undefined,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		});
	}

	// Used for syncing blogs.
	async list(): Promise<Blog[]> {
		const rows = await this._conn.sql<BlogRow[]>`
            SELECT
                id,
                feed_url,
                site_url,
                title,
                synced_at,
                etag,
                last_modified,
				created_at,
				updated_at
            FROM blog;
        `;
		return rows.map((row) =>
			Blog.load({
				id: row.id,
				feedURL: new URL(row.feed_url),
				siteURL: new URL(row.site_url),
				title: row.title,
				syncedAt: row.synced_at,
				etag: row.etag ?? undefined,
				lastModified: row.last_modified ?? undefined,
				createdAt: row.created_at,
				updatedAt: row.updated_at,
			}),
		);
	}

	async update(blog: Blog): Promise<void> {
		const now = new Date();
		const rows = await this._conn.sql`
			UPDATE blog
			SET
				feed_url = ${blog.feedURL.toString()},
				site_url = ${blog.siteURL.toString()},
				title = ${blog.title},
				synced_at = ${blog.syncedAt},
				etag = ${blog.etag ?? null},
				last_modified = ${blog.lastModified ?? null},
				updated_at = ${now}
			WHERE id = ${blog.id}
				AND updated_at = ${blog.updatedAt}
			RETURNING id;
		`;

		if (rows.length !== 1) {
			throw new ConcurrentUpdateError("Blog", blog.id);
		}

		blog.updatedAt = now;
	}

	async delete(blog: Blog): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM blog
			WHERE id = ${blog.id};
		`;
	}
}
