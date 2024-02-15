import { expect, test } from "vitest";

import { sanitize } from "./fetch";

test("sanitize", async () => {
	const html = "<html><head>bye</head>foo <code>python</code> bar</html>";
	expect(sanitize(html)).toEqual("foo bar");
});
