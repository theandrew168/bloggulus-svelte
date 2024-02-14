import Parser from "rss-parser";

import { defaultPageFetcher, type PageFetcher } from "./fetch";

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
		const updatedAt = item.pubDate ? new Date(item.pubDate) : new Date();
		const body = item.contentSnippet;
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

/**
 * Hydrate missing page data from a blog's posts (using the given PageFetcher).
 */
export async function hydrateFeed(feed: FeedBlog, pageFetcher: PageFetcher = defaultPageFetcher): Promise<FeedBlog> {
	for (const post of feed.posts) {
		if (!post.body) {
			post.body = await pageFetcher.fetchPage(post.url);
		}
	}
	return feed;
}
