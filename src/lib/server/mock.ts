import type { FeedBlog } from "./feed";
import type { FetchFeedResponse } from "./fetch";

export function mockAtomFeed(feed: FeedBlog): string {
	const blog = `
		<title>${feed.title}</title>
		<link href="${feed.siteUrl}" rel="alternate"/>
		<link href="${feed.feedUrl}" rel="self"/>
	`;
	const posts = feed.posts.map((post) => {
		const content = `<content type="html">${post.body}</content>`;
		return `
			<entry>
				<title>${post.title}</title>
				<link href="${post.url}" rel="alternate"/>
				<published>${post.updatedAt.toISOString()}</published>
				<updated>${post.updatedAt.toISOString()}</updated>
				${post.body ? content : ""}
			</entry>
		`;
	});
	const atom = `
		<?xml version="1.0" encoding="utf-8"?>
		<feed>
			${blog}
			${posts.join("\n")}
		</feed>
	`;
	return atom;
}

export class MockPageFetcher {
	private page?: string;

	constructor({ page }: { page?: string }) {
		this.page = page;
	}

	async fetchPage(url: string): Promise<string | undefined> {
		return this.page;
	}
}

export class MockFeedFetcher {
	private feed?: string;
	private etag?: string;
	private lastModified?: string;

	constructor({ feed, etag, lastModified }: { feed?: string; etag?: string; lastModified: string }) {
		this.feed = feed;
		this.etag = etag;
		this.lastModified = lastModified;
	}

	async fetchFeed(url: string, etag?: string, lastModified?: string): Promise<FetchFeedResponse> {
		return {
			feed: this.feed,
			etag: this.etag,
			lastModified: this.lastModified,
		};
	}
}
