import type { FeedBlog, FeedPost } from "./feed";
import type { FetchFeedResponse } from "./fetch";

export const POST_FOO: FeedPost = {
	title: "Foo",
	url: "https://example.com/foo",
	updatedAt: new Date(),
	body: "content about foo",
} as const;
export const POST_BAR: FeedPost = {
	title: "Bar",
	url: "https://example.com/bar",
	updatedAt: new Date(),
} as const;
export const BLOG_FOOBAR: FeedBlog = {
	title: "FooBar",
	siteUrl: "https://example.com",
	feedUrl: "https://example.com/atom.xml",
	posts: [POST_FOO, POST_BAR],
} as const;

export function mockAtomFeed(feed: FeedBlog): string {
	const blog = `
		<title>${feed.title}</title>
		<link href="${feed.siteUrl}" rel="alternate"/>
		<link href="${feed.feedUrl}" rel="self"/>
	`;
	const posts = feed.posts.map((post) => {
		const url = `<link href="${post.url}" rel="alternate"/>`;
		const title = `<title>${post.title}</title>`;
		const content = `<content type="html">${post.body}</content>`;
		return `
			<entry>
				${post.title ? title : ""}
				${post.url ? url : ""}
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

	constructor({ feed, etag, lastModified }: { feed?: string; etag?: string; lastModified?: string }) {
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
