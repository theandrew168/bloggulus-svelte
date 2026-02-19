import { Pool, type PoolClient, type QueryConfig, type QueryResult, type QueryResultRow } from "pg";

import { Config } from "$lib/server/config";

function connectPool(connectionString: string): Pool {
	return new Pool({ connectionString });
}

export class Connection {
	private static _instance?: Connection;
	private _db: Pool | PoolClient;

	constructor(db: Pool | PoolClient) {
		this._db = db;
	}

	static getInstance(): Connection {
		if (!this._instance) {
			const config = Config.getInstance();
			const pool = connectPool(config.databaseURI);
			this._instance = new Connection(pool);
		}

		return this._instance;
	}

	async close(): Promise<void> {
		if (!(this._db instanceof Pool)) {
			throw new Error("Only pools (not individual connections) can be closed.");
		}

		await this._db.end();
		Connection._instance = undefined;
	}

	async query<T extends QueryResultRow>(config: QueryConfig): Promise<QueryResult<T>> {
		return this._db.query<T>(config);
	}

	async withTransaction<T>(callback: (conn: Connection) => Promise<T>): Promise<T> {
		if (!(this._db instanceof Pool)) {
			throw new Error("Transactions cannot be nested.");
		}

		const client = await this._db.connect();
		try {
			await client.query("BEGIN;");

			// Await the callback here to ensure the transaction is completed before returning.
			// Otherwise, the transaction might not be committed or rolled back properly due to
			// errors being missed from unawaited promises.
			const txConn = new Connection(client);
			const result = await callback(txConn);

			await client.query("COMMIT;");
			return result;
		} catch (error) {
			await client.query("ROLLBACK;");
			throw error;
		} finally {
			client.release();
		}
	}
}
