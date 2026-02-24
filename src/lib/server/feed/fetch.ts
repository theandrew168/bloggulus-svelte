import { UnreachableFeedError } from "$lib/server/feed/errors";

const USER_AGENT = "Bloggulus/0.6.0 (+https://bloggulus.com)";

type FetchFunc = typeof fetch;

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

export class FeedFetcher {
	private _fetch: FetchFunc;

	constructor(fetchFunc: FetchFunc = fetch) {
		this._fetch = fetchFunc;
	}

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

			const response = await this._fetch(req.url, { headers });
			const etag = response.headers.get("ETag") ?? undefined;
			const lastModified = response.headers.get("Last-Modified") ?? undefined;

			// If the feed has no new content (304 Not Modified), return headers w/ no feed content.
			if (response.status === 304) {
				return { etag, lastModified };
			}

			// Otherwise, throw a custom error for non-2xx HTTP responses.
			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
			}

			const feed = await response.text();
			return { feed, etag, lastModified };
		} catch (error) {
			throw new UnreachableFeedError(req.url, { cause: error });
		}
	}
}
