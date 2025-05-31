import postgres, { type Sql } from "postgres";

const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

export class Connection {
	private static _instance?: Connection;
	readonly sql: Sql;

	constructor(connectionString: string) {
		this.sql = postgres(connectionString, {
			onnotice: () => {},
		});
	}

	static getInstance(): Connection {
		if (!this._instance) {
			const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
			this._instance = new Connection(connectionString);
		}

		return this._instance;
	}

	async withTransaction(callback: (sql: Sql) => Promise<void>): Promise<void> {
		return this.sql.begin(callback);
	}
}
