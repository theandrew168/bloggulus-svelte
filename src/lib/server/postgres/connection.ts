import postgres, { type Sql } from "postgres";

import { EnvConfig } from "../config/config";

export function connect(connectionString: string): Sql {
	const sql = postgres(connectionString, {
		onnotice: () => {},
	});
	return sql;
}

export class Connection {
	private static _instance?: Connection;
	readonly sql: Sql;

	constructor(sql: Sql) {
		this.sql = sql;
	}

	static getInstance(): Connection {
		if (!this._instance) {
			const config = EnvConfig.getInstance();
			const sql = connect(config.databaseURL);
			this._instance = new Connection(sql);
		}

		return this._instance;
	}

	async close(): Promise<void> {
		if (!this.sql) {
			return;
		}

		await this.sql.end();
		Connection._instance = undefined;
	}

	async withTransaction(callback: (conn: Connection) => Promise<void>): Promise<void> {
		await this.sql.begin(async (tx) => {
			const txConn = new Connection(tx);

			// Await this here to ensure the transaction is completed before returning.
			// Otherwise, the transaction might not be committed or rolled back properly
			// due to errors being missed from unawaited promises.
			await callback(txConn);
		});
	}
}
