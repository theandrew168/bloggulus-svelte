import postgres, { type Sql } from "postgres";

const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

export function getConnectionString(): string {
	return process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
}

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
			const connectionString = getConnectionString();
			const sql = connect(connectionString);
			this._instance = new Connection(sql);
		}

		return this._instance;
	}

	async withTransaction(callback: (conn: Connection) => Promise<void>): Promise<void> {
		return this.sql.begin((tx) => {
			const txConn = new Connection(tx);
			return callback(txConn);
		});
	}
}
