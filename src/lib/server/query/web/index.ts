import { Connection } from "$lib/server/postgres";

import { AccountWebQuery } from "./account";
import { ArticleWebQuery } from "./article";
import { BlogWebQuery } from "./blog";
import { PostWebQuery } from "./post";

export class WebQuery {
	private static _instance?: WebQuery;

	readonly account: AccountWebQuery;
	readonly article: ArticleWebQuery;
	readonly blog: BlogWebQuery;
	readonly post: PostWebQuery;

	constructor(conn: Connection) {
		this.account = new AccountWebQuery(conn);
		this.article = new ArticleWebQuery(conn);
		this.blog = new BlogWebQuery(conn);
		this.post = new PostWebQuery(conn);
	}

	static getInstance(): WebQuery {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new WebQuery(conn);
		}

		return this._instance;
	}
}
