import type { UUID } from "crypto";

import { Connection } from "$lib/server/postgres/connection";
import type { WebQuery } from "$lib/server/query/web";
import type { Account, Article, Blog, BlogDetails, PostDetails } from "$lib/types";

type ArticleRow = {
	title: string;
	url: string;
	blog_title: string;
	blog_url: string;
	published_at: string;
	tags: string[];
};

type Count = {
	count: number;
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
		const rows = await this._conn.sql<Count[]>`
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
			publishedAt: new Date(row.published_at),
			tags: row.tags,
		}));
	}

	async countRecentArticlesByAccount(account: Account): Promise<number> {
		const rows = await this._conn.sql<Count[]>`
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
			publishedAt: new Date(row.published_at),
			tags: row.tags,
		}));
	}

	async countRelevantArticles(search: string): Promise<number> {
		const rows = await this._conn.sql<Count[]>`
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
			publishedAt: new Date(row.published_at),
			tags: row.tags,
		}));
	}

	async countRelevantArticlesByAccount(account: Account, search: string): Promise<number> {
		const rows = await this._conn.sql<Count[]>`
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
			publishedAt: new Date(row.published_at),
			tags: row.tags,
		}));
	}

	async readAccountBySessionID(sessionID: UUID): Promise<Account | undefined> {
		return undefined;
	}

	async listBlogs(account: Account): Promise<Blog[]> {
		return [];
	}

	async listAccounts(): Promise<Account[]> {
		return [];
	}

	async readBlogDetailsByID(blogID: UUID): Promise<BlogDetails | undefined> {
		return undefined;
	}

	async readPostDetailsByID(postID: UUID): Promise<PostDetails | undefined> {
		return undefined;
	}
}
