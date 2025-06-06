import type { AccountRepository } from "$lib/server/domain/repository/account";
import type { BlogRepository } from "$lib/server/domain/repository/blog";
import type { PostRepository } from "$lib/server/domain/repository/post";
import type { Repository } from "$lib/server/domain/repository/repository";
import type { SessionRepository } from "$lib/server/domain/repository/session";
import type { TagRepository } from "$lib/server/domain/repository/tag";
import { Connection } from "$lib/server/postgres/connection";

import { PostgresAccountRepository } from "./account";
import { PostgresBlogRepository } from "./blog";
import { PostgresPostRepository } from "./post";
import { PostgresSessionRepository } from "./session";
import { PostgresTagRepository } from "./tag";

export class PostgresRepository implements Repository {
	private static _instance?: PostgresRepository;
	private _conn: Connection;
	readonly account: AccountRepository;
	readonly session: SessionRepository;
	readonly blog: BlogRepository;
	readonly post: PostRepository;
	readonly tag: TagRepository;

	constructor(conn: Connection) {
		this._conn = conn;
		this.account = new PostgresAccountRepository(conn);
		this.session = new PostgresSessionRepository(conn);
		this.blog = new PostgresBlogRepository(conn);
		this.post = new PostgresPostRepository(conn);
		this.tag = new PostgresTagRepository(conn);
	}

	static getInstance(): PostgresRepository {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new PostgresRepository(conn);
		}

		return this._instance;
	}

	async asUnitOfWork(operation: (repo: Repository) => Promise<void>): Promise<void> {
		return this._conn.withTransaction(async (tx) => {
			const txRepo = new PostgresRepository(tx);
			return operation(txRepo);
		});
	}
}
