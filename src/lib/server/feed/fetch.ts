import { UnreachableFeedError } from "$lib/server/feed/errors";

const USER_AGENT = "Bloggulus/0.5.2 (+https://bloggulus.com)";
const ETAG_HEADER = "ETag";
const LAST_MODIFIED_HEADER = "Last-Modified";

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
	async fetchFeed(req: FetchFeedRequest): Promise<FetchFeedResponse> {
		try {
			const response = await fetch(req.url, {
				headers: {
					"User-Agent": USER_AGENT,
				},
			});

			if (!response.ok) {
				// Throw a custom error for non-2xx HTTP responses.
				throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
			}

			return {
				feed: await response.text(),
				etag: response.headers.get(ETAG_HEADER) ?? undefined,
				lastModified: response.headers.get(LAST_MODIFIED_HEADER) ?? undefined,
			};
		} catch (error) {
			throw new UnreachableFeedError(req.url, { cause: error });
		}
	}
}
