import { UnreachableFeedError } from "$lib/server/feed/errors";

import { isOK, type Headers, type Requester } from "./request";

/**
 * The user agent string to use when fetching feeds.
 */
const USER_AGENT = "Bloggulus/0.7.0 (+https://bloggulus.com)";

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

export class FeedFetcher {
	private _requester: Requester;

	constructor(requester: Requester) {
		this._requester = requester;
	}

	async fetchFeed(req: FetchFeedRequest): Promise<FetchFeedResponse> {
		const headers: Headers = {
			"user-agent": USER_AGENT,
		};
		if (req.etag) {
			headers["if-none-match"] = req.etag;
		}
		if (req.lastModified) {
			headers["if-modified-since"] = req.lastModified;
		}

		const {
			url,
			statusCode,
			statusText,
			headers: responseHeaders,
			body,
		} = await this._requester.request(req.url, { headers });

		const etag = responseHeaders["etag"];
		const lastModified = responseHeaders["last-modified"];

		// If the feed has no new content (304 Not Modified), return headers w/ no feed content.
		if (statusCode === 304) {
			return { url, etag, lastModified };
		}

		// Otherwise, throw a custom error for non-2xx HTTP responses.
		if (!isOK(statusCode)) {
			throw new UnreachableFeedError(req.url, {
				cause: new Error(`HTTP error: ${statusCode} ${statusText}`),
			});
		}

		return { url, feed: body, etag, lastModified };
	}
}
