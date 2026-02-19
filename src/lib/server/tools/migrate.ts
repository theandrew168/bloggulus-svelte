import { readdir, readFile } from "node:fs/promises";

import { SQL } from "sql-template-strings";

import { Connection } from "$lib/server/postgres";

const MIGRATIONS_DIR = "./migrations/";

type MigrationRow = {
	id: string;
	name: string;
};

async function main() {
	console.log("applying migrations...");
	const conn = Connection.getInstance();

	// create migration table if it doesn't exist
	await conn.query(SQL`
		CREATE TABLE IF NOT EXISTS migration (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL UNIQUE
		);
	`);

	// get migrations that are already applied
	const { rows } = await conn.query<MigrationRow>(SQL`SELECT id, name FROM migration`);
	const applied = new Set(rows.map((row) => row.name));

	// get migrations that should be applied
	const migrations = await readdir(MIGRATIONS_DIR);

	// determine missing migrations
	const missing = migrations.filter((migration) => !applied.has(migration));

	// sort missing migrations to preserve order
	missing.sort();

	for (const file of missing) {
		console.log(`applying: ${file}`);
		const path = MIGRATIONS_DIR + file;
		const migrationSQL = await readFile(path, "utf-8");

		// Run each migration (and note it in the migration table) within a transaction.
		await conn.withTransaction(async (tx) => {
			await tx.query({ text: migrationSQL });
			await tx.query(SQL`INSERT INTO migration (name) VALUES (${file});`);
		});
	}

	await conn.close();
	console.log("done!");
}

main();
