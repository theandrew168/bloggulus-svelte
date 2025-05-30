import postgres from "postgres";

import { PostgresBlogStorage, type BlogStorage } from "./blog";
import { RollbackError } from "./errors";
import { PostgresPostStorage, type PostStorage } from "./post";
import { PostgresTagStorage, type TagStorage } from "./tag";

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
			// Calling begin() will start a new database transaction and automatically
			// roll it back if any errors are thrown from the given lambda.
			await this.sql.begin(async (tx) => {
				// Create a new instance of the Storage class using this transaction.
				const storage = new Storage(tx);

				// Use the transaction-based Storage class for this atomic operation.
				// If an error occurs within this operation, the transaction will
				// be rolled back.
				await operation(storage);
			});
		} catch (e) {
			// Check for our special sentinel error and prevent it from propagating
			// if found. All other errors should continue to bubble up.
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
