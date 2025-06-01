import type { UUID } from "node:crypto";

import type { Connection } from "../postgres/connection";
import type { Account } from "./account";
import type { Repository } from "./repository";

// TODO: What is the dep graph between: repository, query, and command?
// query -> repo is fine? I think "account by session" is the only one of these. Not really a query, though.
// command -> repo is fine
// command -> query is fine

// NOTE: Non-pojo's cannot be serialized with SvelteKit. This gives me even more reason
// to believe that queries should be very frontend-specific. For example, it might make
// sense to have different queries for a web frontend vs a mobile frontend vs a REST API.

// Dates can be serialized by SvelteKit but URLs cannot.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types

export type Article = {
	title: string;
	url: string;
	blogTitle: string;
	blogURL: string;
	publishedAt: Date;
	tags: string[];
};

type ArticleRow = {
	title: string;
	url: string;
	blog_title: string;
	blog_url: string;
	published_at: string;
	tags: string[];
};

// Powers the index page.
export async function listRecentArticles(conn: Connection, limit: number, offset: number): Promise<Article[]> {
	const rows = await conn.sql<ArticleRow[]>`
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

// Powers the index page.
export async function listRecentArticlesForAccount(
	conn: Connection,
	account: Account,
	limit: number,
	offset: number,
): Promise<Article[]> {
	const rows = await conn.sql<ArticleRow[]>`
		WITH latest AS (
			SELECT
				post.id
			FROM post
			INNER JOIN blog
				ON blog.id = post.blog_id
			INNER JOIN account_blog
				ON account_blog.blog_id = blog.id
				AND account_blog.account_id = ${account.id}
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

// Powers the index page.
export async function listRelevantArticles(
	conn: Connection,
	search: string,
	limit: number,
	offset: number,
): Promise<Article[]> {
	const rows = await conn.sql<ArticleRow[]>`
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

// Powers the index page.
export async function listRelevantArticlesForAccount(
	conn: Connection,
	account: Account,
	search: string,
	limit: number,
	offset: number,
): Promise<Article[]> {
	const rows = await conn.sql<ArticleRow[]>`
		WITH relevant AS (
			SELECT
				post.id
			FROM post
			INNER JOIN blog
				ON blog.id = post.blog_id
			INNER JOIN account_blog
				ON account_blog.blog_id = blog.id
				AND account_blog.account_id = ${account.id}
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

// Powers the accounts page (admin only).
async function listAccounts(conn: Connection): Promise<Account[]> {
	return [];
}

// Powers authentication middleware.
async function findAccountBySessionID(repo: Repository, sessionID: UUID): Promise<Account | undefined> {
	const session = await repo.session.readByID(sessionID);
	if (!session) {
		return undefined;
	}

	return repo.account.readByID(session.accountID);
}

export type BlogDetails = {
	id: UUID;
	feedURL: string;
	siteURL: string;
	title: string;
	syncedAt?: Date;
};

// Powers the blog details page (admin only).
async function readBlogDetailsByID(conn: Connection, blogID: UUID): Promise<BlogDetails | undefined> {
	return undefined;
}

export type PostDetails = {
	id: UUID;
	blogID: UUID;
	url: string;
	title: string;
	publishedAt: Date;
};

// Powers the post details page (admin only).
async function readPostDetailsByID(conn: Connection, postID: UUID): Promise<PostDetails | undefined> {
	return undefined;
}

export type BlogForAccount = {
	id: UUID;
	title: string;
	siteURL: URL;
	isFollowed: boolean;
};

// Powers the add / follow blogs page.
async function listBlogsForAccount(conn: Connection, account: Account): Promise<BlogForAccount[]> {
	return [];
}
