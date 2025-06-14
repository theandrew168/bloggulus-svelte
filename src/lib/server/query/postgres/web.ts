import type { UUID } from "crypto";

import { Connection } from "$lib/server/postgres";
import type { WebQuery } from "$lib/server/query/web";
import { sha256 } from "$lib/server/utils";
import type { Account, Article, Blog, BlogDetails, PostDetails } from "$lib/types";

type CountRow = {
	count: number;
};

type AccountRow = {
	id: UUID;
	username: string;
	is_admin: boolean;
};

type ArticleRow = {
	title: string;
	url: string;
	blog_title: string;
	blog_url: string;
	published_at: Date;
	tags: string[];
};

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
	synced_at: Date | null;
};

type PostDetailsRow = {
	id: UUID;
	blog_id: UUID;
	url: string;
	title: string;
	published_at: Date;
};

export class PostgresWebQuery implements WebQuery {
	private static _instance?: PostgresWebQuery;
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	static getInstance(): PostgresWebQuery {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new PostgresWebQuery(conn);
		}

		return this._instance;
	}

	async countRecentArticles(): Promise<number> {
		const rows = await this._conn.sql<CountRow[]>`
            SELECT
                COUNT(post.id) AS count
            FROM post;
        `;

		return rows[0].count;
	}

	async listRecentArticles(limit: number, offset: number): Promise<Article[]> {
		const rows = await this._conn.sql<ArticleRow[]>`
            WITH latest AS (
                SELECT
                    post.id
                FROM post
                ORDER BY post.published_at DESC
                LIMIT ${limit} OFFSET ${offset}
            )
            SELECT
                post.title,
                post.url,
                MAX(blog.title) as blog_title,
                MAX(blog.site_url) as blog_url,
                post.published_at,
                (ARRAY_REMOVE(ARRAY_AGG(tag.name ORDER BY ts_rank_cd(post.fts_data, plainto_tsquery('english', tag.name)) DESC), NULL))[1:3] as tags
            FROM latest
            INNER JOIN post
                ON post.id = latest.id
            INNER JOIN blog
                ON blog.id = post.blog_id
            LEFT JOIN tag
                ON plainto_tsquery('english', tag.name) @@ post.fts_data
            GROUP BY post.id
            ORDER BY post.published_at DESC;
        `;

		return rows.map((row) => ({
			title: row.title,
			url: row.url,
			blogTitle: row.blog_title,
			blogURL: row.blog_url,
			publishedAt: row.published_at,
			tags: row.tags,
		}));
	}

	async countRecentArticlesByAccount(account: Account): Promise<number> {
		const rows = await this._conn.sql<CountRow[]>`
            SELECT
                COUNT(post.id) AS count
            FROM post
            INNER JOIN blog
                ON blog.id = post.blog_id
            INNER JOIN account_blog
                ON account_blog.blog_id = blog.id
            INNER JOIN account
                ON account.id = account_blog.account_id
            WHERE account.id = ${account.id};
        `;

		return rows[0].count;
	}

	async listRecentArticlesByAccount(account: Account, limit: number, offset: number): Promise<Article[]> {
		const rows = await this._conn.sql<ArticleRow[]>`
            WITH latest AS (
                SELECT
                    post.id
                FROM post
                INNER JOIN blog
                    ON blog.id = post.blog_id
                INNER JOIN account_blog
                    ON account_blog.blog_id = blog.id
                INNER JOIN account
                    ON account.id = account_blog.account_id
                WHERE account.id = ${account.id}
                ORDER BY post.published_at DESC
                LIMIT ${limit} OFFSET ${offset}
            )
            SELECT
                post.title,
                post.url,
                MAX(blog.title) as blog_title,
                MAX(blog.site_url) as blog_url,
                post.published_at,
                (ARRAY_REMOVE(ARRAY_AGG(tag.name ORDER BY ts_rank_cd(post.fts_data, plainto_tsquery('english', tag.name)) DESC), NULL))[1:3] as tags
            FROM latest
            INNER JOIN post
                ON post.id = latest.id
            INNER JOIN blog
                ON blog.id = post.blog_id
            LEFT JOIN tag
                ON plainto_tsquery('english', tag.name) @@ post.fts_data
            GROUP BY post.id
            ORDER BY post.published_at DESC;
        `;

		return rows.map((row) => ({
			title: row.title,
			url: row.url,
			blogTitle: row.blog_title,
			blogURL: row.blog_url,
			publishedAt: row.published_at,
			tags: row.tags,
		}));
	}

	async countRelevantArticles(search: string): Promise<number> {
		const rows = await this._conn.sql<CountRow[]>`
            SELECT
                COUNT(post.id) AS count
            FROM post
            WHERE post.fts_data @@ websearch_to_tsquery('english',  ${search});
        `;

		return rows[0].count;
	}

	async listRelevantArticles(search: string, limit: number, offset: number): Promise<Article[]> {
		const rows = await this._conn.sql<ArticleRow[]>`
            WITH relevant AS (
                SELECT
                    post.id
                FROM post
                ORDER BY ts_rank_cd(post.fts_data, websearch_to_tsquery('english',  ${search})) DESC
                LIMIT ${limit} OFFSET ${offset}
            )
            SELECT
                post.title,
                post.url,
                MAX(blog.title) as blog_title,
                MAX(blog.site_url) as blog_url,
                post.published_at,
                (ARRAY_REMOVE(ARRAY_AGG(tag.name ORDER BY ts_rank_cd(post.fts_data, plainto_tsquery('english', tag.name)) DESC), NULL))[1:3] as tags
            FROM relevant
            INNER JOIN post
                ON post.id = relevant.id
            INNER JOIN blog
                ON blog.id = post.blog_id
            LEFT JOIN tag
                ON plainto_tsquery('english', tag.name) @@ post.fts_data
            WHERE post.fts_data @@ websearch_to_tsquery('english',  ${search})
            GROUP BY post.id
            ORDER BY ts_rank_cd(post.fts_data, websearch_to_tsquery('english',  ${search})) DESC;
        `;

		return rows.map((row) => ({
			title: row.title,
			url: row.url,
			blogTitle: row.blog_title,
			blogURL: row.blog_url,
			publishedAt: row.published_at,
			tags: row.tags,
		}));
	}

	async countRelevantArticlesByAccount(account: Account, search: string): Promise<number> {
		const rows = await this._conn.sql<CountRow[]>`
            SELECT
                COUNT(post.id) AS count
            FROM post
            INNER JOIN blog
                ON blog.id = post.blog_id
            INNER JOIN account_blog
                ON account_blog.blog_id = blog.id
            INNER JOIN account
                ON account.id = account_blog.account_id
            WHERE account.id = ${account.id}
                AND post.fts_data @@ websearch_to_tsquery('english',  ${search});
        `;

		return rows[0].count;
	}

	async listRelevantArticlesByAccount(
		account: Account,
		search: string,
		limit: number,
		offset: number,
	): Promise<Article[]> {
		const rows = await this._conn.sql<ArticleRow[]>`
            WITH relevant AS (
                SELECT
                    post.id
                FROM post
                INNER JOIN blog
                    ON blog.id = post.blog_id
                INNER JOIN account_blog
                    ON account_blog.blog_id = blog.id
                INNER JOIN account
                    ON account.id = account_blog.account_id
                WHERE account.id = ${account.id}
                ORDER BY ts_rank_cd(post.fts_data, websearch_to_tsquery('english',  ${search})) DESC
                LIMIT ${limit} OFFSET ${offset}
            )
            SELECT
                post.title,
                post.url,
                MAX(blog.title) as blog_title,
                MAX(blog.site_url) as blog_url,
                post.published_at,
                (ARRAY_REMOVE(ARRAY_AGG(tag.name ORDER BY ts_rank_cd(post.fts_data, plainto_tsquery('english', tag.name)) DESC), NULL))[1:3] as tags
            FROM relevant
            INNER JOIN post
                ON post.id = relevant.id
            INNER JOIN blog
                ON blog.id = post.blog_id
            LEFT JOIN tag
                ON plainto_tsquery('english', tag.name) @@ post.fts_data
            WHERE post.fts_data @@ websearch_to_tsquery('english',  ${search})
            GROUP BY post.id
            ORDER BY ts_rank_cd(post.fts_data, websearch_to_tsquery('english',  ${search})) DESC;
        `;

		return rows.map((row) => ({
			title: row.title,
			url: row.url,
			blogTitle: row.blog_title,
			blogURL: row.blog_url,
			publishedAt: row.published_at,
			tags: row.tags,
		}));
	}

	async readAccountBySessionToken(sessionToken: string): Promise<Account | undefined> {
		const sessionTokenHash = sha256(sessionToken);
		const rows = await this._conn.sql<AccountRow[]>`
            SELECT
                account.id,
                account.username,
                account.is_admin
            FROM account
            INNER JOIN session
                ON session.account_id = account.id
            WHERE session.token_hash = ${sessionTokenHash};
        `;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return {
			id: row.id,
			username: row.username,
			isAdmin: row.is_admin,
		};
	}

	async listBlogs(account: Account): Promise<Blog[]> {
		const rows = await this._conn.sql<BlogRow[]>`
            SELECT
                blog.id,
                blog.title,
                blog.site_url,
                account_blog.account_id IS NOT NULL AS is_followed
            FROM blog
            LEFT JOIN account_blog
                ON account_blog.blog_id = blog.id
            LEFT JOIN account
                ON account.id = account_blog.account_id
            WHERE account.id = ${account.id};
        `;

		return rows.map((row) => ({
			id: row.id,
			title: row.title,
			siteURL: row.site_url,
			isFollowed: row.is_followed,
		}));
	}

	async listAccounts(): Promise<Account[]> {
		const rows = await this._conn.sql<AccountRow[]>`
            SELECT
                account.id,
                account.username,
                account.is_admin
            FROM account;
        `;

		return rows.map((row) => ({
			id: row.id,
			username: row.username,
			isAdmin: row.is_admin,
		}));
	}

	async readBlogDetailsByID(blogID: UUID): Promise<BlogDetails | undefined> {
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
			syncedAt: row.synced_at ?? undefined,
		};
	}

	async readPostDetailsByID(postID: UUID): Promise<PostDetails | undefined> {
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
}
