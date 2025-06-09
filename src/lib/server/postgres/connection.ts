import postgres, { type Sql } from "postgres";

const LOCAL_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";
const TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/postgres";

export function getConnectionString(): string {
	if (process.env.NODE_ENV === "test") {
		return TEST_DATABASE_URL;
	}

	return process.env.DATABASE_URL || LOCAL_DATABASE_URL;
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
		await this.sql.begin(async (tx) => {
			const txConn = new Connection(tx);

			// Await this here to ensure the transaction is completed before returning.
			// Otherwise, the transaction might not be committed or rolled back properly
			// due to errors being missed from unawaited promises.
			await callback(txConn);
		});
	}
}
