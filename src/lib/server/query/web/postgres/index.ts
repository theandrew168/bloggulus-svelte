import { Connection } from "$lib/server/postgres";
import type { WebQuery } from "$lib/server/query/web";
import type { AccountWebQuery } from "$lib/server/query/web/account";
import type { ArticleWebQuery } from "$lib/server/query/web/article";
import type { BlogWebQuery } from "$lib/server/query/web/blog";
import type { PostWebQuery } from "$lib/server/query/web/post";

import { PostgresAccountWebQuery } from "./account";
import { PostgresArticleWebQuery } from "./article";
import { PostgresBlogWebQuery } from "./blog";
import { PostgresPostWebQuery } from "./post";

export class PostgresWebQuery implements WebQuery {
	private static _instance?: PostgresWebQuery;

	readonly account: AccountWebQuery;
	readonly article: ArticleWebQuery;
	readonly blog: BlogWebQuery;
	readonly post: PostWebQuery;

	constructor(conn: Connection) {
		this.account = new PostgresAccountWebQuery(conn);
		this.article = new PostgresArticleWebQuery(conn);
		this.blog = new PostgresBlogWebQuery(conn);
		this.post = new PostgresPostWebQuery(conn);
	}

	static getInstance(): PostgresWebQuery {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new PostgresWebQuery(conn);
		}

		return this._instance;
	}
}
