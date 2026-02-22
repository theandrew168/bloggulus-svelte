import { SQL } from "sql-template-strings";

import { Connection } from "$lib/server/postgres";
import type { Account, Article } from "$lib/types";

import type { CountRow } from "./types";

type ArticleRow = {
	title: string;
	url: string;
	blog_title: string;
	blog_url: string;
	published_at: Date;
	tags: string[];
};

export class ArticleWebQuery {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	// Powers the index page.
	async countRecent(): Promise<number> {
		const { rows } = await this._conn.query<CountRow>(SQL`
            SELECT
                COUNT(post.id)::INTEGER AS count
            FROM post
            INNER JOIN blog
                ON blog.id = post.blog_id
            WHERE blog.is_public = true;
        `);

		return rows[0]?.count ?? -1;
	}

	// Powers the index page.
	async listRecent(limit: number, offset: number): Promise<Article[]> {
		const { rows } = await this._conn.query<ArticleRow>(SQL`
            WITH latest AS (
                SELECT
                    post.id
                FROM post
                INNER JOIN blog
                    ON blog.id = post.blog_id
                WHERE blog.is_public = true
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
        `);

		return rows.map((row) => ({
			title: row.title,
			url: new URL(row.url),
			blogTitle: row.blog_title,
			blogURL: new URL(row.blog_url),
			publishedAt: row.published_at,
			tags: row.tags,
		}));
	}

	// Powers the index page.
	async countRecentByAccount(account: Account): Promise<number> {
		const { rows } = await this._conn.query<CountRow>(SQL`
            SELECT
                COUNT(post.id)::INTEGER AS count
            FROM post
            INNER JOIN blog
                ON blog.id = post.blog_id
            INNER JOIN account_blog
                ON account_blog.blog_id = blog.id
            INNER JOIN account
                ON account.id = account_blog.account_id
            WHERE account.id = ${account.id};
        `);

		return rows[0]?.count ?? -1;
	}

	// Powers the index page.
	async listRecentByAccount(account: Account, limit: number, offset: number): Promise<Article[]> {
		const { rows } = await this._conn.query<ArticleRow>(SQL`
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
        `);

		return rows.map((row) => ({
			title: row.title,
			url: new URL(row.url),
			blogTitle: row.blog_title,
			blogURL: new URL(row.blog_url),
			publishedAt: row.published_at,
			tags: row.tags,
		}));
	}

	// Powers the index page (when searching).
	async countRelevant(search: string): Promise<number> {
		const { rows } = await this._conn.query<CountRow>(SQL`
            SELECT
                COUNT(post.id)::INTEGER AS count
            FROM post
            INNER JOIN blog
                ON blog.id = post.blog_id
            WHERE post.fts_data @@ websearch_to_tsquery('english',  ${search})
              AND blog.is_public = true;
        `);

		return rows[0]?.count ?? -1;
	}

	// Powers the index page (when searching).
	async listRelevant(search: string, limit: number, offset: number): Promise<Article[]> {
		const { rows } = await this._conn.query<ArticleRow>(SQL`
            WITH relevant AS (
                SELECT
                    post.id
                FROM post
                INNER JOIN blog
                    ON blog.id = post.blog_id
                WHERE blog.is_public = true
                ORDER BY ts_rank_cd(post.fts_data, websearch_to_tsquery('english',  ${search})) DESC NULLS LAST
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
            ORDER BY ts_rank_cd(post.fts_data, websearch_to_tsquery('english',  ${search})) DESC NULLS LAST;
        `);

		return rows.map((row) => ({
			title: row.title,
			url: new URL(row.url),
			blogTitle: row.blog_title,
			blogURL: new URL(row.blog_url),
			publishedAt: row.published_at,
			tags: row.tags,
		}));
	}

	// Powers the index page (when searching).
	async countRelevantByAccount(account: Account, search: string): Promise<number> {
		const { rows } = await this._conn.query<CountRow>(SQL`
            SELECT
                COUNT(post.id)::INTEGER AS count
            FROM post
            INNER JOIN blog
                ON blog.id = post.blog_id
            INNER JOIN account_blog
                ON account_blog.blog_id = blog.id
            INNER JOIN account
                ON account.id = account_blog.account_id
            WHERE account.id = ${account.id}
                AND post.fts_data @@ websearch_to_tsquery('english',  ${search});
        `);

		return rows[0]?.count ?? -1;
	}

	// Powers the index page (when searching).
	async listRelevantByAccount(account: Account, search: string, limit: number, offset: number): Promise<Article[]> {
		const { rows } = await this._conn.query<ArticleRow>(SQL`
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
                ORDER BY ts_rank_cd(post.fts_data, websearch_to_tsquery('english',  ${search})) DESC NULLS LAST
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
            ORDER BY ts_rank_cd(post.fts_data, websearch_to_tsquery('english',  ${search})) DESC NULLS LAST;
        `);

		return rows.map((row) => ({
			title: row.title,
			url: new URL(row.url),
			blogTitle: row.blog_title,
			blogURL: new URL(row.blog_url),
			publishedAt: row.published_at,
			tags: row.tags,
		}));
	}
}
