import { request } from "undici";
import type { IncomingHttpHeaders } from "undici/types/header";

import { UnreachableFeedError } from "$lib/server/feed/errors";

const USER_AGENT = "Bloggulus/0.7.0 (+https://bloggulus.com)";

const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308];

export type FetchFeedRequest = {
	url: URL;
	etag?: string;
	lastModified?: string;
};

export type RedirectFetchFeedResponse = {
	kind: "redirect";
	location: string;
};

export type ResolvedFetchFeedResponse = {
	kind: "resolved";
	feed?: string;
	etag?: string;
	lastModified?: string;
};

export type FetchFeedResponse = RedirectFetchFeedResponse | ResolvedFetchFeedResponse;

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
			const headers: Record<string, string> = {
				"user-agent": USER_AGENT,
			};
			if (req.etag) {
				headers["if-none-match"] = req.etag;
			}
			if (req.lastModified) {
				headers["if-modified-since"] = req.lastModified;
			}

			const { statusCode, statusText, headers: responseHeaders, body } = await request(req.url.href, { headers });
			const etag = extractHeader(responseHeaders, "etag");
			const lastModified = extractHeader(responseHeaders, "last-modified");

			if (REDIRECT_STATUS_CODES.includes(statusCode)) {
				const location = extractHeader(responseHeaders, "location");
				if (!location) {
					throw new UnreachableFeedError(req.url, {
						cause: new Error(`Redirect status code ${statusCode} received without Location header`),
					});
				}
				return { kind: "redirect", location };
			}

			// If the feed has no new content (304 Not Modified), return headers w/ no feed content.
			if (statusCode === 304) {
				return { kind: "resolved", etag, lastModified };
			}

			// Otherwise, throw a custom error for non-2xx HTTP responses.
			if (statusCode < 200 || statusCode >= 300) {
				throw new UnreachableFeedError(req.url, {
					cause: new Error(`HTTP error: ${statusCode} ${statusText}`),
				});
			}

			const feed = await body.text();
			return { kind: "resolved", feed, etag, lastModified };
		} catch (error) {
			throw new UnreachableFeedError(req.url, { cause: error });
		}
	}
}
