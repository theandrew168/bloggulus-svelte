import postgres from "postgres";

import { PostgresBlogStorage, type BlogStorage } from "./blog";
import { PostgresPostStorage, type PostStorage } from "./post";
import { PostgresTagStorage, type TagStorage } from "./tag";

const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

export type Operation = (storage: Storage) => Promise<void>;
export type TransactionOptions = {
	commit: boolean;
};

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

	async transaction(operation: Operation, options?: TransactionOptions) {
		const commit = options?.commit ?? true;

		await this.sql.begin(async (tx) => {
			const storage = new Storage(tx);
			await operation(storage);

			// The 'begin' function will automatically rollback if any errors are thrown,
			// otherwise it will commit. Since the library doesn't have a way to intentionally
			// rollback (testing within a transaction, for example), we do a manual rollback.
			// The 'and chain' serves to prevent a warning when 'begin' eventually commits.
			//
			// Reference:
			// https://github.com/porsager/postgres/issues/500
			if (!commit) {
				await tx`rollback and chain`;
			}
		});
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
