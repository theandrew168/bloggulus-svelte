import { expect, test } from "vitest";

import sql from "./db";

test("sql", async () => {
	const result = await sql`SELECT 1`;
	expect(result.length).toEqual(1);
});
