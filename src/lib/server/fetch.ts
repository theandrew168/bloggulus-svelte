import he from "he";

/**
 * Fetch the plain-text contents of a web page (by its URL).
 */
export type FetchPageFn = (url: string) => Promise<string | undefined>;

/**
 * Response from fetching an RSS feed. Each field is independently optional.
 */
export type FetchFeedResponse = {
	feed?: string;
	etag?: string;
	lastModified?: string;
};

/**
 * Fetch an RSS feed (by its URL) while respecting modification headers.
 */
export type FetchFeedFn = (url: string, etag?: string, lastModified?: string) => Promise<FetchFeedResponse>;

/**
 * Sanitize and strip HTML from a piece of text.
 */
export function sanitize(html: string): string {
	const exprs = [/<head>.*?<\/head>/gs, /<nav>.*?<\/nav>/gs, /<code>.*?<\/code>/gs, /<pre>.*?<\/pre>/gs, /<[^>]*>/gs];

	let text = html;
	exprs.forEach((expr) => (text = text.replace(expr, "")));

	text = he.decode(text);
	text = text.replace(/\s+/gs, " ");
	text = text.trim();
	return text;
}

/**
 * Fetch a page's contents and sanitize / strip the resulting HTML.
 */
export async function fetchPage(url: string, fetchFn: typeof fetch = fetch): Promise<string | undefined> {
	try {
		const resp = await fetchFn(url);
		const text = await resp.text();
		const page = sanitize(text);
		return page;
	} catch (e) {
		console.log(e);
		return;
	}
}

/**
 * Fetch an RSS feed (by its URL) while respecting modification headers.
 */
export async function fetchFeed(
	url: string,
	etag?: string,
	lastModified?: string,
	fetchFn: typeof fetch = fetch,
): Promise<FetchFeedResponse> {
	const headers = new Headers();
	if (etag) {
		headers.set("If-None-Match", etag);
	}
	if (lastModified) {
		headers.set("If-Modified-Since", lastModified);
	}

	const fetchFeedResponse: FetchFeedResponse = {};

	try {
		const resp = await fetchFn(url, { headers });

		// check for an "ETag" header on the response
		const etag = resp.headers.get("ETag");
		if (etag) {
			fetchFeedResponse.etag = etag;
		}

		// check for a "Last-Modified" header on the response
		const lastModified = resp.headers.get("Last-Modified");
		if (lastModified) {
			fetchFeedResponse.lastModified = lastModified;
		}

		// nothing was modified since we last checked, so exit early
		if (resp.status >= 300) {
			return fetchFeedResponse;
		}

		// else load the feed contents
		fetchFeedResponse.feed = await resp.text();
		return fetchFeedResponse;
	} catch (e) {
		console.log(e);
		return {};
	}
}
