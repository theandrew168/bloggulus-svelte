import postgres from "postgres";

const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

const sql = postgres(process.env.DATABASE_URL || DEFAULT_DATABASE_URL, {
	idle_timeout: 20,
	max_lifetime: 60 * 30,
	transform: postgres.camel,
	onnotice: () => {},
});

export default sql;
