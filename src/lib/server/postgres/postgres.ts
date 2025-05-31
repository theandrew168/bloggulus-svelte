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
			console.log("Creating a new instance of Connection");
			const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
			this._instance = new Connection(connectionString);
		}

		return this._instance;
	}
}
