import { request } from "undici";
import type { IncomingHttpHeaders } from "undici/types/header";

import { UnreachableFeedError } from "$lib/server/feed/errors";

const USER_AGENT = "Bloggulus/0.6.0 (+https://bloggulus.com)";

export type FetchFeedRequest = {
	url: URL;
	etag?: string;
	lastModified?: string;
};

export type FetchFeedResponse = {
	feed?: string;
	etag?: string;
	lastModified?: string;
};

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
				"User-Agent": USER_AGENT,
			};
			if (req.etag) {
				headers["If-None-Match"] = req.etag;
			}
			if (req.lastModified) {
				headers["If-Modified-Since"] = req.lastModified;
			}

			const { statusCode, statusText, headers: responseHeaders, body } = await request(req.url.href, { headers });
			const etag = extractHeader(responseHeaders, "ETag");
			const lastModified = extractHeader(responseHeaders, "Last-Modified");

			// If the feed has no new content (304 Not Modified), return headers w/ no feed content.
			if (statusCode === 304) {
				return { etag, lastModified };
			}

			// Otherwise, throw a custom error for non-2xx HTTP responses.
			if (statusCode < 200 || statusCode >= 300) {
				throw new Error(`HTTP error: ${statusCode} ${statusText}`);
			}

			const feed = await body.text();
			return { feed, etag, lastModified };
		} catch (error) {
			throw new UnreachableFeedError(req.url, { cause: error });
		}
	}
}
