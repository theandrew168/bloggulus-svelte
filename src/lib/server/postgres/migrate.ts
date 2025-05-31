import { readdir } from "node:fs/promises";

import { Connection } from "./connection";

const MIGRATIONS_DIR = "./migrations/";

type Migration = {
	id: string;
	name: string;
};

async function main() {
	console.log("applying migrations...");
	const conn = Connection.getInstance();

	// create migration table if it doesn't exist
	await conn.sql`
		CREATE TABLE IF NOT EXISTS migration (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL UNIQUE
		)`;

	// get migrations that are already applied
	const rows = await conn.sql<Migration[]>`SELECT id, name FROM migration`;
	const applied = rows.map((row) => row.name);

	// get migrations that should be applied
	const migrations = await readdir(MIGRATIONS_DIR);

	// determine missing migrations
	const missing = migrations.filter((migration) => !applied.includes(migration));

	// sort missing migrations to preserve order
	missing.sort();

	for (const file of missing) {
		// run each migration within a transaction
		await conn.withTransaction(async (sql) => {
			// apply the missing ones
			console.log("applying: ", file);
			const path = MIGRATIONS_DIR + file;
			await sql.file(path);

			// update migration table
			await sql`INSERT INTO migration (name) VALUES (${file})`;
		});
	}

	await conn.sql.end();
	console.log("done!");
}

main();
