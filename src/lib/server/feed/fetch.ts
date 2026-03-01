import { request } from "undici";
import type { IncomingHttpHeaders } from "undici/types/header";

import { UnreachableFeedError } from "$lib/server/feed/errors";

/**
 * The user agent string to use when fetching feeds.
 */
const USER_AGENT = "Bloggulus/0.7.0 (+https://bloggulus.com)";

/**
 * HTTP status codes that indicate a redirect. If one of these is encountered
 * when fetching a feed, the fetcher will attempt to follow the redirect.
 */
const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308];

/**
 * Number of times to follow redirects when fetching a feed before giving up.
 * This is to prevent infinite redirect loops.
 */
const MAX_REDIRECT_COUNT = 5;

type Headers = Record<string, string>;

export type FetchFeedRequest = {
	url: URL;
	etag?: string;
	lastModified?: string;
};

export type FetchFeedResponse = {
	url: URL;
	feed?: string;
	etag?: string;
	lastModified?: string;
};

// async function fetchWithRedirects(url: URL, requestHeaders: Headers) {
// 	const response = await request(url.toString(), { headers: requestHeaders });
// }

function isOK(statusCode: number): boolean {
	return statusCode >= 200 && statusCode < 300;
}

function extractHeader(headers: IncomingHttpHeaders, name: string): string | undefined {
	const value = headers[name] ?? headers[name.toLowerCase()];
	if (Array.isArray(value)) {
		return value[0];
	}

	return value;
}

export class FeedFetcher {
	async fetchFeed(req: FetchFeedRequest): Promise<FetchFeedResponse> {
		try {
			const headers: Headers = {
				"user-agent": USER_AGENT,
			};
			if (req.etag) {
				headers["if-none-match"] = req.etag;
			}
			if (req.lastModified) {
				headers["if-modified-since"] = req.lastModified;
			}

			let resolvedURL = req.url;
			let redirectCount = 0;
			let resp = await request(req.url.href, { headers });
			while (REDIRECT_STATUS_CODES.includes(resp.statusCode) && redirectCount < MAX_REDIRECT_COUNT) {
				const location = extractHeader(resp.headers, "location");
				if (!location) {
					throw new UnreachableFeedError(req.url, {
						cause: new Error(`Redirect status code ${resp.statusCode} received without Location header`),
					});
				}

				resp = await request(location, { headers });
				resolvedURL = new URL(location);
				redirectCount++;
			}

			const etag = extractHeader(resp.headers, "etag");
			const lastModified = extractHeader(resp.headers, "last-modified");

			// If the feed has no new content (304 Not Modified), return headers w/ no feed content.
			if (resp.statusCode === 304) {
				return { url: resolvedURL, etag, lastModified };
			}

			// Otherwise, throw a custom error for non-2xx HTTP responses.
			if (!isOK(resp.statusCode)) {
				throw new UnreachableFeedError(req.url, {
					cause: new Error(`HTTP error: ${resp.statusCode} ${resp.statusText}`),
				});
			}

			const feed = await resp.body.text();
			return { url: resolvedURL, feed, etag, lastModified };
		} catch (error) {
			// Catch and wrap any unexpected network errors thrown my undici.request.
			throw new UnreachableFeedError(req.url, { cause: error });
		}
	}
}
