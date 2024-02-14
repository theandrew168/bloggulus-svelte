import { expect, test } from "vitest";

import { sanitize } from "./fetch";

/*
 * tests to write:
 * verify that feeds return 301 if unmodified
 * verify that etag / LM values make it to the DB
 */

test("sanitize", async () => {
	const html = "<html><head>bye</head>foo <code>python</code> bar</html>";
	expect(sanitize(html)).toEqual("foo bar");
});
