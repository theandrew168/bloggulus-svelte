import type { Item } from "rss-parser";
import { describe, expect, it } from "vitest";

import { determinePostURL, determinePublishedAt, determineSiteURL } from "./parse";

describe("feed/parse", () => {
	describe("determineSiteURL", () => {
		it("should use the given siteURL if provided", () => {
			const feedURL = "https://example.com/atom.xml";
			const siteURL = "https://example.com/blog";
			const determinedSiteURL = determineSiteURL(feedURL, siteURL);
			expect(determinedSiteURL).toEqual("https://example.com/blog");
		});

		it("should use the feedURL's origin if not siteURL is provided", () => {
			const feedURL = "https://example.com/atom.xml";
			const determinedSiteURL = determineSiteURL(feedURL);
			expect(determinedSiteURL).toEqual("https://example.com");
		});
	});

	describe("determinePostURL", () => {
		it("should use the given postURL if absolute and with protocol", () => {
			const postURL = "https://example.com/posts/1";
			const siteURL = "https://example.com";
			const determinedPostURL = determinePostURL(postURL, siteURL);
			expect(determinedPostURL).toEqual("https://example.com/posts/1");
		});

		it("should make relative postURLs absolute (based on the siteURL)", () => {
			const postURL = "/posts/1";
			const siteURL = "https://example.com";
			const determinedPostURL = determinePostURL(postURL, siteURL);
			expect(determinedPostURL).toEqual("https://example.com/posts/1");
		});

		it("should handle double slashes when making relative URLs absolute", () => {
			const postURL = "/posts/1";
			const siteURL = "https://example.com/";
			const determinedPostURL = determinePostURL(postURL, siteURL);
			expect(determinedPostURL).toEqual("https://example.com/posts/1");
		});

		it("should default to https if no protocol is provided", () => {
			const postURL = "example.com/posts/1";
			const siteURL = "https://example.com/";
			const determinedPostURL = determinePostURL(postURL, siteURL);
			expect(determinedPostURL).toEqual("https://example.com/posts/1");
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
});
