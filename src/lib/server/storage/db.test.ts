import { expect, test } from "vitest";

import db from "./db";

test("db", async () => {
	const result = await db`SELECT 1`;
	expect(result.length).toEqual(1);
});
