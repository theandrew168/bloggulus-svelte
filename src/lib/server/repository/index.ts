import { Connection } from "$lib/server/postgres";

import { AccountRepository } from "./account";
import { BlogRepository } from "./blog";
import { PostRepository } from "./post";
import { SessionRepository } from "./session";
import { TagRepository } from "./tag";

export class Repository {
	private static _instance?: Repository;
	private _conn: Connection;

	readonly account: AccountRepository;
	readonly session: SessionRepository;
	readonly blog: BlogRepository;
	readonly post: PostRepository;
	readonly tag: TagRepository;

	constructor(conn: Connection) {
		this._conn = conn;
		this.account = new AccountRepository(conn);
		this.session = new SessionRepository(conn);
		this.blog = new BlogRepository(conn);
		this.post = new PostRepository(conn);
		this.tag = new TagRepository(conn);
	}

	static getInstance(): Repository {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new Repository(conn);
		}

		return this._instance;
	}

	async asUnitOfWork(operation: (repo: Repository) => Promise<void>): Promise<void> {
		await this._conn.withTransaction(async (tx) => {
			const txRepo = new Repository(tx);
			await operation(txRepo);
		});
	}
}
