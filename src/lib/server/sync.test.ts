import { expect, test } from "vitest";

/*
 * stuff to do:

 * split fetch -> feed / page
 * split domain types into backend / user? (UserBlog)
 * add DB types for "string | null" to "string?" conversions?
 * use Go-style camel casing (validUUID) and reduce postgres.js naming magic
 * run DB tests inside a tx (optional tx param w/ default?)
 * 
 * 
 * 
 * tests to write:
 * 
 * verify that feeds return 301 if unmodified
 * verify that etag / LM values make it to the DB
 * skip items without a link / title
 * only sync each blog once an hour
 * only create new posts (by URL)
 * update post if a body is eventually found
 * skip feeds (via URL) with no content
 * test feed parsing
 * test feed hydration
 */

test("todo", async () => {
	expect(true).toEqual(true);
});
