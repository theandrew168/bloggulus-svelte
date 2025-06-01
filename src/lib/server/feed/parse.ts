import Parser from "rss-parser";

export type FeedBlog = {
	feedUrl: string;
	siteUrl: string;
	title: string;
	posts: FeedPost[];
};

export type FeedPost = {
	url: string;
	title: string;
	publishedAt: Date;
	content?: string;
};

/**
 * Parse an RSS / Atom feed (this doesn't fetch the feed itself).
 */
export async function parseFeed(url: string, feed: string): Promise<FeedBlog> {
	const parser = new Parser();
	const parsedFeed = await parser.parseString(feed);

	const posts: FeedPost[] = [];
	for (const item of parsedFeed.items) {
		// skip any items that lack a link and / or title
		if (!item.link || !item.title) {
			continue;
		}

		const url = item.link;
		const title = item.title;
		const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
		const post: FeedPost = {
			url,
			title,
			publishedAt,
		};
		if (item.contentSnippet) {
			post.content = item.contentSnippet;
		}
		posts.push(post);
	}

	const siteUrl = parsedFeed.link ?? url;
	const title = parsedFeed.title ?? siteUrl;

	const blog: FeedBlog = {
		feedUrl: url,
		siteUrl,
		title,
		posts,
	};
	return blog;
}
