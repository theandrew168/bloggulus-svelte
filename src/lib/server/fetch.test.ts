import { expect, test, vi } from "vitest";

import { fetchFeed, fetchPage, sanitize } from "./fetch";

test("sanitize", async () => {
	const html = "<html><head>bye</head>foo <code>python</code> bar</html>";
	expect(sanitize(html)).toEqual("foo bar");
});

test("fetchPage", async () => {
	const text = "<html><head>bye</head>foo <code>python</code> bar</html>";

	const fetch = vi.fn();
	fetch.mockResolvedValue({ text: () => new Promise((resolve) => resolve(text)) });

	const page = await fetchPage("using mock fetch", fetch);
	expect(fetch).toHaveBeenCalled();
	expect(page).toEqual("foo bar");
});

// TODO: Find a better way mock fetch
// test("fetchFeed", async () => {
// 	const text = "RSS Feed XML stuff";

// 	const fetch = vi.fn();
// 	fetch.mockResolvedValue({ text: () => new Promise((resolve) => resolve(text)) });

// 	const feed = await fetchFeed("using mock fetch", 'etag', 'lastModified', fetch);
// 	expect(fetch).toHaveBeenCalled();
// 	expect(feed.feed).toEqual(text);
// });
