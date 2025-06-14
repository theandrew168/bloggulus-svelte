import type { Config } from "..";

const LOCAL_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";
const TEST_DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/postgres";

export class EnvConfig implements Config {
	private static _instance?: EnvConfig;

	readonly databaseURL: string;
	readonly enableDebugAuth: boolean;

	constructor() {
		const isTest = process.env.NODE_ENV === "test";
		const isDevelopment = process.env.NODE_ENV === "development";
		if (isTest) {
			this.databaseURL = TEST_DATABASE_URL;
		} else {
			this.databaseURL = process.env.DATABASE_URL || LOCAL_DATABASE_URL;
		}

		this.enableDebugAuth = isDevelopment || process.env.ENABLE_DEBUG_AUTH === "true";
	}

	static getInstance(): EnvConfig {
		if (!this._instance) {
			this._instance = new EnvConfig();
		}

		return this._instance;
	}
}
