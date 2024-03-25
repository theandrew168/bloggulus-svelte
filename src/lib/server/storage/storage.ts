import postgres from "postgres";

import { PostgresBlogStorage, type BlogStorage } from "./blog";
import { PostgresPostStorage, type PostStorage } from "./post";
import { PostgresTagStorage, type TagStorage } from "./tag";
import { RollbackError } from "./errors";

const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

export type Operation = (storage: Storage) => Promise<void>;

export class Storage {
	private sql: postgres.Sql;

	readonly blog: BlogStorage;
	readonly post: PostStorage;
	readonly tag: TagStorage;

	constructor(sql: postgres.Sql) {
		this.sql = sql;

		this.blog = new PostgresBlogStorage(this.sql);
		this.post = new PostgresPostStorage(this.sql);
		this.tag = new PostgresTagStorage(this.sql);
	}

	async transaction(operation: Operation) {
		try {
			await this.sql.begin(async (tx) => {
				const storage = new Storage(tx);
				await operation(storage);
			});
		} catch (e) {
			const isRollbackError = e instanceof RollbackError;
			if (!isRollbackError) {
				throw e;
			}
		}
	}
}

export function connect(): Storage {
	const sql = postgres(process.env.DATABASE_URL || DEFAULT_DATABASE_URL, {
		idle_timeout: 20,
		max_lifetime: 60 * 30,
		transform: postgres.camel,
		onnotice: () => {},
	});

	return new Storage(sql);
}
