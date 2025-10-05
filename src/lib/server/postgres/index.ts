import { parse } from "pg-connection-string";
import postgres, { type Sql } from "postgres";

import { Config } from "$lib/server/config";

function connect(connectionString: string): Sql {
	const options = parse(connectionString);

	const rawHost = options.host || undefined;
	const port = parseInt(options.port || "5432", 10);

	// If the host starts with a slash, we assume it's a Unix socket.
	// In that case, we don't set the `host` option and instead set the `path` option.
	const host = rawHost?.startsWith("/") ? undefined : rawHost;
	const path = rawHost?.startsWith("/") ? `${rawHost}/.s.PGSQL.${port}` : undefined;

	const sql = postgres({
		host,
		path,
		port,
		database: options.database || undefined,
		username: options.user,
		password: options.password,
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
			const config = Config.getInstance();
			const sql = connect(config.databaseURI);
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
