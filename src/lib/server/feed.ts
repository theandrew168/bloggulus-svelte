import Parser from "rss-parser";

import type { FetchPageFn } from "./fetch";

export type FeedBlog = {
	feedUrl: string;
	siteUrl: string;
	title: string;
	posts: FeedPost[];
};

export type FeedPost = {
	url: string;
	title: string;
	updatedAt: Date;
	body?: string;
};

/**
 * Parse an RSS / Atom feed (this doesn't fetch the feed itself). The fetchPage
 * function will be used to fill in any content gaps.
 */
export async function parseFeed(url: string, feed: string, fetchPage: FetchPageFn): Promise<FeedBlog> {
	const parser = new Parser();
	const parsedFeed = await parser.parseString(feed);

	const posts: FeedPost[] = [];
	for (const item of parsedFeed.items) {
		const url = item.link ?? "";
		const title = item.title ?? "";
		const updatedAt = item.pubDate ? new Date(item.pubDate) : new Date();
		const body = item.contentSnippet ?? (await fetchPage(url));
		const post: FeedPost = {
			url,
			title,
			updatedAt,
			body,
		};
		posts.push(post);
	}

	const siteUrl = parsedFeed.link ?? url;
	const title = parsedFeed.title ?? siteUrl;

	const blog: FeedBlog = {
		feedUrl: url,
		siteUrl,
		title,
		posts: posts,
	};
	return blog;
}
