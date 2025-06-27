import Parser, { type Item } from "rss-parser";

import { InvalidFeedError } from "./errors";

export type FeedBlog = {
	feedURL: URL;
	siteURL: URL;
	title: string;
	posts: FeedPost[];
};

export type FeedPost = {
	url: URL;
	title: string;
	publishedAt: Date;
	content?: string;
};

export function determineSiteURL(feedURL: URL, siteURL?: string): URL {
	// If the site URL is provided, use it.
	if (siteURL) {
		return new URL(siteURL);
	}

	// Otherwise, extract the origin from the feed URL.
	return new URL(feedURL.origin);
}

export function determinePostURL(postURL: string, siteURL: URL): URL {
	let url = postURL;

	// If the post URL is relative, make it absolute.
	if (url.startsWith("/")) {
		url = new URL(url, siteURL).toString();
	}

	// If the post URL is missing a protocol, default to https.
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		url = `https://${url}`;
	}

	return new URL(url);
}

export function determinePublishedAt(item: Item, now: Date): Date {
	// If the item has a pubDate, use it.
	if (item.pubDate) {
		return new Date(item.pubDate);
	}

	// Otherwise, if the item has an isoDate, use it.
	if (item.isoDate) {
		return new Date(item.isoDate);
	}

	// If all else fails, use the current time.
	return now;
}

/**
 * Parse an RSS / Atom feed (this doesn't fetch the feed itself).
 */
export async function parseFeed(url: URL, feed: string): Promise<FeedBlog> {
	const parser = new Parser();

	let parsedFeed: Awaited<ReturnType<typeof parser.parseString>>;
	try {
		parsedFeed = await parser.parseString(feed);
	} catch (error) {
		throw new InvalidFeedError(url, { cause: error });
	}

	const siteURL = determineSiteURL(url, parsedFeed.link);

	const posts: FeedPost[] = [];
	for (const item of parsedFeed.items) {
		// skip any items that lack a link and / or title
		if (!item.link || !item.title) {
			continue;
		}

		const url = determinePostURL(item.link, siteURL);
		const title = item.title;
		const publishedAt = determinePublishedAt(item, new Date());

		const post: FeedPost = {
			url,
			title,
			publishedAt,
			content: item.contentSnippet,
		};
		posts.push(post);
	}

	const title = parsedFeed.title ?? siteURL.toString();
	const blog: FeedBlog = {
		feedURL: url,
		siteURL,
		title,
		posts,
	};
	return blog;
}
