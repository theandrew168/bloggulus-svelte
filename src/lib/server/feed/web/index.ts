import type { FeedFetcher, FetchFeedRequest, FetchFeedResponse } from "..";

const USER_AGENT = "Bloggulus/0.5.2 (+https://bloggulus.com)";

export class WebFeedFetcher implements FeedFetcher {
	async fetchFeed(req: FetchFeedRequest): Promise<FetchFeedResponse> {
		const response = await fetch(req.url.toString(), {
			headers: {
				"User-Agent": USER_AGENT,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch feed from ${req.url.toString()}: ${response.statusText}`);
		}

		return {
			feed: await response.text(),
			etag: response.headers.get("ETag") ?? undefined,
			lastModified: response.headers.get("Last-Modified") ?? undefined,
		};
	}
}
