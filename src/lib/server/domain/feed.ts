export type FeedBlog = {
	feedURL: URL;
	siteURL: URL;
	title: string;
	posts: FeedPost[];
};

export type FeedPost = {
	url: URL;
	title: string;
	content?: string;
	publishedAt: Date;
};

export type FeedParser = {
	parseFeed: (url: URL, feed: string) => Promise<FeedBlog | undefined>;
};

export type FeedFetcher = {
	fetchFeed: (feedURL: URL) => Promise<string | undefined>;
};
