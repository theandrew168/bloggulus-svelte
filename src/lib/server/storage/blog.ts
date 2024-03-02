import _ from "lodash";
import type postgres from "postgres";

import type { Blog } from "$lib/types";

export type CreateBlogParams = {
	feedUrl: string;
	siteUrl: string;
	title: string;
	syncedAt: Date;
	etag: string | null;
	lastModified: string | null;
};

export type UpdateBlogParams = Partial<CreateBlogParams>;

const columns = ["id", "feed_url", "site_url", "title", "synced_at", "etag", "last_modified"];

export type BlogStorage = {
	create: (params: CreateBlogParams) => Promise<Blog>;
	list: () => Promise<Blog[]>;
	readById: (id: string) => Promise<Blog | undefined>;
	readByFeedUrl: (feedUrl: string) => Promise<Blog | undefined>;
	update: (blog: Blog, params: UpdateBlogParams) => Promise<void>;
	delete: (blog: Blog) => Promise<void>;
};

export class PostgresBlogStorage {
	private sql: postgres.Sql;

	constructor(sql: postgres.Sql) {
		this.sql = sql;
	}

	async create(params: CreateBlogParams): Promise<Blog> {
		const created = await this.sql<Blog[]>`
			INSERT INTO blog ${this.sql(params)}
			RETURNING ${this.sql(columns)}
		`;
		return created[0];
	}

	async list(): Promise<Blog[]> {
		const blogs = await this.sql<Blog[]>`
			SELECT ${this.sql(columns)}
			FROM blog
		`;
		return blogs;
	}

	async readById(id: string): Promise<Blog | undefined> {
		const blogs = await this.sql<Blog[]>`
			SELECT ${this.sql(columns)}
			FROM blog
			WHERE id = ${id}
		`;
		if (blogs.length !== 1) {
			return undefined;
		}
		return blogs[0];
	}

	async readByFeedUrl(feedUrl: string): Promise<Blog | undefined> {
		const blogs = await this.sql<Blog[]>`
			SELECT ${this.sql(columns)}
			FROM blog
			WHERE feed_url = ${feedUrl}
		`;
		if (blogs.length !== 1) {
			return undefined;
		}
		return blogs[0];
	}

	async update(blog: Blog, params: UpdateBlogParams) {
		// clone params here because _.defaults() mutates the dest object
		const resolved = _.defaults(_.clone(params), blog);
		await this.sql`
			UPDATE blog
			SET ${this.sql(resolved, "feedUrl", "siteUrl", "title", "syncedAt", "etag", "lastModified")}
			WHERE id = ${blog.id}
		`;
	}

	async delete(blog: Blog) {
		await this.sql`
			DELETE
			FROM blog
			WHERE id = ${blog.id}
		`;
	}
}
