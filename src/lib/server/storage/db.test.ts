import { beforeAll, expect, test } from "vitest";

import sql from "./db";

beforeAll(async () => {
	await sql`DELETE FROM tag`;
	await sql`DELETE FROM post`;
	await sql`DELETE FROM blog`;
});

test("sql", async () => {
	const result = await sql`SELECT 1`;
	expect(result.length).toEqual(1);
});
