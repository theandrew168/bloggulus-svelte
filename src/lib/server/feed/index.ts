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

export type FeedFetcher = {
	fetchFeed: (req: FetchFeedRequest) => Promise<FetchFeedResponse>;
};
