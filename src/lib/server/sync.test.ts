import { describe, expect, test } from "vitest";

import { connect } from "./storage/storage";

/*
 * verify that etag / LM values make it to the DB
 * skip items without a link / title
 * only sync each blog once an hour
 * only create new posts (by URL)
 * update post if a body is eventually found
 * skip feeds (via URL) with no content
 */

describe("SyncService", () => {
	const storage = connect();

	test("only sync each blog once per hour", async () => {
		expect(true).toEqual(true);
	});
});
