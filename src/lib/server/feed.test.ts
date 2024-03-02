import { expect, test } from "vitest";

import { parseFeed, type FeedBlog, type FeedPost, hydrateFeed } from "./feed";
import { MockPageFetcher, mockAtomFeed } from "./mock";

const foo: FeedPost = {
	title: "Foo",
	url: "https://example.com/foo",
	updatedAt: new Date(),
	body: "content about foo",
};
const bar: FeedPost = {
	title: "Bar",
	url: "https://example.com/bar",
	updatedAt: new Date(),
};
const fooBar: FeedBlog = {
	title: "FooBar",
	siteUrl: "https://example.com",
	feedUrl: "https://example.com/atom.xml",
	posts: [foo, bar],
};

test("parseFeed", async () => {
	const url = fooBar.feedUrl;
	const atom = mockAtomFeed(fooBar);

	const gotBlog = await parseFeed(url, atom);
	expect(gotBlog.title).to.equal(fooBar.title);
	expect(gotBlog.siteUrl).to.equal(fooBar.siteUrl);
	expect(gotBlog.feedUrl).to.equal(fooBar.feedUrl);
	for (let i = 0; i < gotBlog.posts.length; i++) {
		const gotPost = gotBlog.posts[i];
		const wantPost = fooBar.posts[i];
		expect(gotPost.url).to.equal(wantPost.url);
		expect(gotPost.title).to.equal(wantPost.title);
		expect(gotPost.updatedAt.toISOString()).to.equal(wantPost.updatedAt.toISOString());
		expect(gotPost.body).to.equal(wantPost.body);
	}
});

test("hydrateFeed (no content)", async () => {
	const url = fooBar.feedUrl;
	const atom = mockAtomFeed(fooBar);
	const blog = await parseFeed(url, atom);

	const pageFetcher = new MockPageFetcher({});
	const hydratedBlog = await hydrateFeed(blog, pageFetcher);
	const bar = hydratedBlog.posts.find((post) => post.title === "Bar");
	expect(bar).to.not.be.undefined;
	expect(bar?.body).to.be.undefined;
});

test("hydrateFeed (has content)", async () => {
	const url = fooBar.feedUrl;
	const atom = mockAtomFeed(fooBar);
	const blog = await parseFeed(url, atom);

	const page = "content about bar";
	const pageFetcher = new MockPageFetcher({ page });
	const hydratedBlog = await hydrateFeed(blog, pageFetcher);
	const bar = hydratedBlog.posts.find((post) => post.title === "Bar");
	expect(bar).to.not.be.undefined;
	expect(bar?.body).to.equal(page);
});
