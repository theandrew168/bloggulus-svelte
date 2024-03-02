import { expect, test } from "vitest";

import { parseFeed, hydrateFeed } from "./feed";
import { BLOG_FOOBAR, MockPageFetcher, mockAtomFeed } from "./mock";

test("parseFeed", async () => {
	const url = BLOG_FOOBAR.feedUrl;
	const atom = mockAtomFeed(BLOG_FOOBAR);

	const gotBlog = await parseFeed(url, atom);
	expect(gotBlog.title).to.equal(BLOG_FOOBAR.title);
	expect(gotBlog.siteUrl).to.equal(BLOG_FOOBAR.siteUrl);
	expect(gotBlog.feedUrl).to.equal(BLOG_FOOBAR.feedUrl);
	for (let i = 0; i < gotBlog.posts.length; i++) {
		const gotPost = gotBlog.posts[i];
		const wantPost = BLOG_FOOBAR.posts[i];
		expect(gotPost.url).to.equal(wantPost.url);
		expect(gotPost.title).to.equal(wantPost.title);
		expect(gotPost.updatedAt.toISOString()).to.equal(wantPost.updatedAt.toISOString());
		expect(gotPost.body).to.equal(wantPost.body);
	}
});

test("hydrateFeed (no content)", async () => {
	const url = BLOG_FOOBAR.feedUrl;
	const atom = mockAtomFeed(BLOG_FOOBAR);
	const blog = await parseFeed(url, atom);

	const pageFetcher = new MockPageFetcher({});
	const hydratedBlog = await hydrateFeed(blog, pageFetcher);
	const bar = hydratedBlog.posts.find((post) => post.title === "Bar");
	expect(bar).to.not.be.undefined;
	expect(bar?.body).to.be.undefined;
});

test("hydrateFeed (has content)", async () => {
	const url = BLOG_FOOBAR.feedUrl;
	const atom = mockAtomFeed(BLOG_FOOBAR);
	const blog = await parseFeed(url, atom);

	const page = "content about bar";
	const pageFetcher = new MockPageFetcher({ page });
	const hydratedBlog = await hydrateFeed(blog, pageFetcher);
	const bar = hydratedBlog.posts.find((post) => post.title === "Bar");
	expect(bar).to.not.be.undefined;
	expect(bar?.body).to.equal(page);
});
