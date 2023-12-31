import { readdir } from "fs/promises";

import sql from "../src/lib/server/db";

const MIGRATIONS_DIR = "./migrations/";

type Migration = {
	id: string;
	name: string;
};

async function main() {
	console.log("applying migrations...");

	// create migration table if it doesn't exist
	await sql`
		CREATE TABLE IF NOT EXISTS migration (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL UNIQUE
		)`;

	// get migrations that are already applied
	const rows = await sql<Migration[]>`SELECT id, name FROM migration`;
	const applied = rows.map((row) => row.name);

	// get migrations that should be applied
	const migrations = await readdir(MIGRATIONS_DIR);

	// determine missing migrations
	const missing = migrations.filter((migration) => !applied.includes(migration));

	// sort missing migrations to preserve order
	missing.sort();

	for (const file of missing) {
		// apply the missing ones
		console.log("applying: ", file);
		const path = MIGRATIONS_DIR + file;
		await sql.file(path);

		// update migration table
		await sql`INSERT INTO migration (name) VALUES (${file})`;
	}

	console.log("done!");
}

main()
	.then(async () => {
		await sql.end();
	})
	.catch(async (e) => {
		console.error(e);
		await sql.end();
		process.exit(1);
	});
