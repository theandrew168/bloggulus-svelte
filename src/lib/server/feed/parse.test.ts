import Chance from "chance";
import type { Item } from "rss-parser";
import { describe, expect, it } from "vitest";
import xml2js from "xml2js";

import {
	determinePostURL,
	determinePublishedAt,
	determineSiteURL,
	parseFeed,
	type FeedBlog,
	type FeedPost,
} from "./parse";

type PartialFeedPost = Partial<FeedPost>;
type PartialFeedBlog = Omit<Partial<FeedBlog>, "posts"> & {
	posts: PartialFeedPost[];
};

function generateAtomFeed(blog: PartialFeedBlog): string {
	const builder = new xml2js.Builder();
	const xml = builder.buildObject({
		feed: {
			title: blog.title,
			link: [
				{ $: { rel: "self", href: blog.feedURL?.toString() } },
				{ $: { rel: "alternate", href: blog.siteURL?.toString() } },
			],
			entry: blog.posts.map((post) => ({
				...(post.url ? { link: { $: { href: post.url?.toString() } } } : {}),
				title: post.title,
				content: post.content,
				published: post.publishedAt?.toISOString(),
			})),
		},
	});
	return xml;
}

function generateRSSFeed(blog: PartialFeedBlog): string {
	const builder = new xml2js.Builder();
	const xml = builder.buildObject({
		rss: {
			$: { version: "2.0" },
			channel: {
				title: blog.title,
				link: blog.siteURL?.toString(),
				item: blog.posts.map((post) => ({
					title: post.title,
					link: post.url?.toString(),
					pubDate: post.publishedAt?.toUTCString(),
					description: post.content,
				})),
			},
		},
	});
	return xml;
}

describe("feed/parse", () => {
	const chance = new Chance();

	describe("determineSiteURL", () => {
		it("should use the given siteURL if provided", () => {
			const feedURL = new URL("https://example.com/atom.xml");
			const siteURL = "https://example.com/blog";
			const determinedSiteURL = determineSiteURL(feedURL, siteURL);
			expect(determinedSiteURL.toString()).toEqual("https://example.com/blog");
		});

		it("should use the feedURL's origin if not siteURL is provided", () => {
			const feedURL = new URL("https://example.com/atom.xml");
			const determinedSiteURL = determineSiteURL(feedURL);
			expect(determinedSiteURL.toString()).toEqual("https://example.com/");
		});
	});

	describe("determinePostURL", () => {
		it("should use the given postURL if absolute and with protocol", () => {
			const postURL = "https://example.com/posts/1";
			const siteURL = new URL("https://example.com");
			const determinedPostURL = determinePostURL(postURL, siteURL);
			expect(determinedPostURL.toString()).toEqual("https://example.com/posts/1");
		});

		it("should make relative postURLs absolute (based on the siteURL)", () => {
			const postURL = "/posts/1";
			const siteURL = new URL("https://example.com");
			const determinedPostURL = determinePostURL(postURL, siteURL);
			expect(determinedPostURL.toString()).toEqual("https://example.com/posts/1");
		});

		it("should handle double slashes when making relative URLs absolute", () => {
			const postURL = "/posts/1";
			const siteURL = new URL("https://example.com");
			const determinedPostURL = determinePostURL(postURL, siteURL);
			expect(determinedPostURL.toString()).toEqual("https://example.com/posts/1");
		});

		it("should default to https if no protocol is provided", () => {
			const postURL = "example.com/posts/1";
			const siteURL = new URL("https://example.com");
			const determinedPostURL = determinePostURL(postURL, siteURL);
			expect(determinedPostURL.toString()).toEqual("https://example.com/posts/1");
		});
	});

	describe("determinePublishedAt", () => {
		it("should return the pubDate if available", () => {
			const pubDate = new Date();
			const item = { pubDate: pubDate.toISOString() } as Item;

			const now = new Date();
			const publishedAt = determinePublishedAt(item, now);
			expect(publishedAt).toEqual(new Date(pubDate));
		});

		it("should return the isoDate if pubDate is not available", () => {
			const isoDate = new Date();
			const item = { isoDate: isoDate.toISOString() } as Item;

			const now = new Date();
			const publishedAt = determinePublishedAt(item, now);
			expect(publishedAt).toEqual(new Date(isoDate));
		});

		it("should return the current time if neither pubDate nor isoDate is available", () => {
			const item = {} as Item;

			const now = new Date();
			const publishedAt = determinePublishedAt(item, now);
			expect(publishedAt).toEqual(now);
		});
	});

	describe("parseFeed", () => {
		it("should parse an Atom feed and return a FeedBlog object", async () => {
			const feedURL = new URL(chance.url());
			const blog: FeedBlog = {
				feedURL,
				siteURL: new URL(chance.url()),
				title: chance.sentence(),
				posts: [
					{
						url: new URL(chance.url()),
						title: chance.sentence(),
						publishedAt: new Date("2023-01-01T00:00:00Z"),
						content: chance.paragraph(),
					},
					{
						url: new URL(chance.url()),
						title: chance.sentence(),
						publishedAt: new Date("2023-01-02T00:00:00Z"),
					},
				],
			};

			const feedXML = generateAtomFeed(blog);
			const parsedFeed = await parseFeed(feedURL, feedXML);

			expect(parsedFeed.feedURL.toString()).toEqual(blog.feedURL.toString());
			expect(parsedFeed.siteURL.toString()).toEqual(blog.siteURL.toString());
			expect(parsedFeed.title).toEqual(blog.title);

			expect(parsedFeed.posts.length).toEqual(blog.posts.length);

			expect(parsedFeed.posts[0].url.toString()).toEqual(blog.posts[0].url.toString());
			expect(parsedFeed.posts[0].title).toEqual(blog.posts[0].title);
			expect(parsedFeed.posts[0].publishedAt).toEqual(blog.posts[0].publishedAt);
			expect(parsedFeed.posts[0].content).toEqual(blog.posts[0].content);

			expect(parsedFeed.posts[1].url.toString()).toEqual(blog.posts[1].url.toString());
			expect(parsedFeed.posts[1].title).toEqual(blog.posts[1].title);
			expect(parsedFeed.posts[1].publishedAt).toEqual(blog.posts[1].publishedAt);
			expect(parsedFeed.posts[1].content).toBeUndefined();
		});

		it("should parse an RSS feed and return a FeedBlog object", async () => {
			const feedURL = new URL(chance.url());
			const blog: FeedBlog = {
				feedURL,
				siteURL: new URL(chance.url()),
				title: chance.sentence(),
				posts: [
					{
						url: new URL(chance.url()),
						title: chance.sentence(),
						publishedAt: new Date("2023-01-01T00:00:00Z"),
						content: chance.paragraph(),
					},
					{
						url: new URL(chance.url()),
						title: chance.sentence(),
						publishedAt: new Date("2023-01-02T00:00:00Z"),
					},
				],
			};

			const feedXML = generateRSSFeed(blog);
			const parsedFeed = await parseFeed(feedURL, feedXML);

			expect(parsedFeed.feedURL.toString()).toEqual(blog.feedURL.toString());
			expect(parsedFeed.siteURL.toString()).toEqual(blog.siteURL.toString());
			expect(parsedFeed.title).toEqual(blog.title);

			expect(parsedFeed.posts.length).toEqual(blog.posts.length);

			expect(parsedFeed.posts[0].url.toString()).toEqual(blog.posts[0].url.toString());
			expect(parsedFeed.posts[0].title).toEqual(blog.posts[0].title);
			expect(parsedFeed.posts[0].publishedAt).toEqual(blog.posts[0].publishedAt);
			expect(parsedFeed.posts[0].content).toEqual(blog.posts[0].content);

			expect(parsedFeed.posts[1].url.toString()).toEqual(blog.posts[1].url.toString());
			expect(parsedFeed.posts[1].title).toEqual(blog.posts[1].title);
			expect(parsedFeed.posts[1].publishedAt).toEqual(blog.posts[1].publishedAt);
			expect(parsedFeed.posts[1].content).toBeUndefined();
		});

		it("should skip posts that are missing a link", async () => {
			const feedURL = new URL(chance.url());
			const blog: PartialFeedBlog = {
				feedURL,
				siteURL: new URL(chance.url()),
				title: chance.sentence(),
				posts: [
					{
						url: new URL(chance.url()),
						title: chance.sentence(),
						publishedAt: new Date("2023-01-01T00:00:00Z"),
						content: chance.paragraph(),
					},
					{
						url: new URL(chance.url()),
						title: chance.sentence(),
						publishedAt: new Date("2023-01-02T00:00:00Z"),
						content: chance.paragraph(),
					},
					{
						// This post is missing a link.
						title: chance.sentence(),
						publishedAt: new Date("2023-01-03T00:00:00Z"),
						content: chance.paragraph(),
					},
				],
			};

			const feedXML = generateAtomFeed(blog);
			const parsedFeed = await parseFeed(feedURL, feedXML);

			// The post without a link should be skipped.
			expect(parsedFeed.posts.length).toEqual(2);
		});

		it("should skip posts that are missing a title", async () => {
			const feedURL = new URL(chance.url());
			const blog: PartialFeedBlog = {
				feedURL,
				siteURL: new URL(chance.url()),
				title: chance.sentence(),
				posts: [
					{
						url: new URL(chance.url()),
						title: chance.sentence(),
						publishedAt: new Date("2023-01-01T00:00:00Z"),
						content: chance.paragraph(),
					},
					{
						url: new URL(chance.url()),
						title: chance.sentence(),
						publishedAt: new Date("2023-01-02T00:00:00Z"),
						content: chance.paragraph(),
					},
					{
						// This post is missing a title.
						url: new URL(chance.url()),
						publishedAt: new Date("2023-01-03T00:00:00Z"),
						content: chance.paragraph(),
					},
				],
			};

			const feedXML = generateAtomFeed(blog);
			const parsedFeed = await parseFeed(feedURL, feedXML);

			// The post without a title should be skipped.
			expect(parsedFeed.posts.length).toEqual(2);
		});
	});
});
