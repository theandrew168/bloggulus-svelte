import { expect, test, vi } from "vitest";
import { fetchBody, sanitize } from "./sync";

const fetch = vi.fn();

test("sanitize", async () => {
	const html = "<html><head>bye</head>foo <code>python</code> bar</html>";
	expect(sanitize(html)).toEqual("foo bar");
});

test("fetchBody", async () => {
	const html = "<html><head>bye</head>foo <code>python</code> bar</html>";
	fetch.mockResolvedValue({ text: () => new Promise((resolve) => resolve(html)) });
	global.fetch = fetch;

	const body = await fetchBody("using mock fetch");
	expect(fetch).toHaveBeenCalled();
	expect(body).toEqual("foo bar");
});
