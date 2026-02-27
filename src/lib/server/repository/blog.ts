import { SQL } from "sql-template-strings";

import { Blog } from "$lib/server/blog";
import { Meta } from "$lib/server/meta";
import { Connection } from "$lib/server/postgres";
import type { UUID } from "$lib/types";

import { ConcurrentUpdateError } from "./errors";

type BlogRow = {
	id: UUID;
	feed_url: string;
	site_url: string;
	title: string;
	synced_at: Date;
	is_public: boolean;
	etag: string | null;
	last_modified: string | null;
	meta_created_at: Date;
	meta_updated_at: Date;
	meta_version: number;
};

function rowToBlog(row: BlogRow): Blog {
	const meta = Meta.load({
		createdAt: row.meta_created_at,
		updatedAt: row.meta_updated_at,
		version: row.meta_version,
	});

	return Blog.load({
		id: row.id,
		feedURL: new URL(row.feed_url),
		siteURL: new URL(row.site_url),
		title: row.title,
		syncedAt: row.synced_at,
		isPublic: row.is_public,
		etag: row.etag ?? undefined,
		lastModified: row.last_modified ?? undefined,
		meta,
	});
}

export class BlogRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(blog: Blog): Promise<void> {
		await this._conn.query(SQL`
			INSERT INTO blog (
				id,
				feed_url,
				site_url,
				title,
				synced_at,
				is_public,
				etag,
				last_modified,
				meta_created_at,
				meta_updated_at,
				meta_version
			) VALUES (
                ${blog.id},
                ${blog.feedURL.toString()},
                ${blog.siteURL.toString()},
                ${blog.title},
                ${blog.syncedAt},
				${blog.isPublic},
                ${blog.etag ?? null},
                ${blog.lastModified ?? null},
				${blog.meta.createdAt},
				${blog.meta.updatedAt},
				${blog.meta.version}
            );
		`);
	}

	async readByID(id: UUID): Promise<Blog | undefined> {
		const { rows } = await this._conn.query<BlogRow>(SQL`
            SELECT
                id,
                feed_url,
                site_url,
                title,
                synced_at,
				is_public,
                etag,
                last_modified,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM blog
            WHERE id = ${id};
        `);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return rowToBlog(row);
	}

	async readByFeedURL(feedURL: URL): Promise<Blog | undefined> {
		const { rows } = await this._conn.query<BlogRow>(SQL`
            SELECT
                id,
                feed_url,
                site_url,
                title,
                synced_at,
				is_public,
                etag,
                last_modified,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM blog
            WHERE feed_url = ${feedURL.toString()};
        `);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return rowToBlog(row);
	}

	// Used for syncing blogs.
	async list(): Promise<Blog[]> {
		const { rows } = await this._conn.query<BlogRow>(SQL`
            SELECT
                id,
                feed_url,
                site_url,
                title,
                synced_at,
				is_public,
                etag,
                last_modified,
				meta_created_at,
				meta_updated_at,
				meta_version
            FROM blog;
        `);
		return rows.map(rowToBlog);
	}

	async update(blog: Blog): Promise<void> {
		const newUpdatedAt = new Date();
		const newVersion = blog.meta.version + 1;

		const { rows } = await this._conn.query(SQL`
			UPDATE blog
			SET
				feed_url = ${blog.feedURL.toString()},
				site_url = ${blog.siteURL.toString()},
				title = ${blog.title},
				synced_at = ${blog.syncedAt},
				is_public = ${blog.isPublic},
				etag = ${blog.etag ?? null},
				last_modified = ${blog.lastModified ?? null},
				meta_updated_at = ${newUpdatedAt},
				meta_version = ${newVersion}
			WHERE id = ${blog.id}
				AND meta_version = ${blog.meta.version}
			RETURNING id;
		`);

		if (rows.length !== 1) {
			throw new ConcurrentUpdateError("Concurrent update detected", "Blog", "id", blog.id);
		}

		blog.meta.updatedAt = newUpdatedAt;
		blog.meta.version = newVersion;
	}

	async delete(blog: Blog): Promise<void> {
		await this._conn.query(SQL`
			DELETE
			FROM blog
			WHERE id = ${blog.id};
		`);
	}
}
