import Chance from "chance";
import { describe, expect, it, vi } from "vitest";

import { UnreachableFeedError } from "./errors";
import { FeedFetcher } from "./fetch";
import { Requester } from "./request";

describe("feed/fetch", () => {
	const chance = new Chance();

	describe("FeedFetcher", () => {
		describe("fetchFeed", () => {
			it("should fetch a feed and return its content, etag, and last modified", async () => {
				const url = new URL(chance.url());
				const feed = "<feed>Example Feed</feed>";
				const etag = chance.word();
				const lastModified = chance.date().toISOString();

				const requester = new Requester();
				vi.spyOn(requester, "request").mockImplementation(async (reqURL) => {
					expect(reqURL.toString()).toEqual(url.toString());
					return {
						url: reqURL,
						statusCode: 200,
						statusText: "OK",
						headers: {
							etag,
							"last-modified": lastModified,
						},
						body: feed,
					};
				});

				const fetcher = new FeedFetcher(requester);
				const response = await fetcher.fetchFeed({ url });
				expect(response.feed).to.equal(feed);
				expect(response.etag).to.equal(etag);
				expect(response.lastModified).to.equal(lastModified);
			});

			it("should include etag and last modified headers if present", async () => {
				const url = new URL(chance.url());
				const feed = "<feed>Example Feed</feed>";

				const etag = chance.word();
				const lastModified = chance.date().toISOString();

				const requester = new Requester();
				vi.spyOn(requester, "request").mockImplementation(async (reqURL, reqOpts) => {
					expect(reqURL.toString()).toEqual(url.toString());
					expect(reqOpts?.headers).toMatchObject({
						"if-none-match": etag,
						"if-modified-since": lastModified,
					});
					return {
						url: reqURL,
						statusCode: 200,
						statusText: "OK",
						headers: {},
						body: feed,
					};
				});
				const fetcher = new FeedFetcher(requester);
				await fetcher.fetchFeed({ url, etag, lastModified });
			});

			it("should return an empty feed for 304 Not Modified responses", async () => {
				const url = new URL(chance.url());
				const etag = chance.word();
				const lastModified = chance.date().toISOString();

				const requester = new Requester();
				vi.spyOn(requester, "request").mockImplementation(async (reqURL) => {
					expect(reqURL.toString()).toEqual(url.toString());

					return {
						url: reqURL,
						statusCode: 304,
						statusText: "Not Modified",
						headers: {
							etag,
							"last-modified": lastModified,
						},
						body: "",
					};
				});

				const fetcher = new FeedFetcher(requester);
				const response = await fetcher.fetchFeed({ url });
				expect(response.feed).to.be.undefined;
				expect(response.etag).to.equal(etag);
				expect(response.lastModified).to.equal(lastModified);
			});

			it("should throw an UnreachableFeedError for non-2xx, non-304 responses", async () => {
				const url = new URL(chance.url());

				const requester = new Requester();
				vi.spyOn(requester, "request").mockImplementation(async (reqURL) => {
					expect(reqURL.toString()).toEqual(url.toString());
					return {
						url: reqURL,
						statusCode: 404,
						statusText: "Not Found",
						headers: {},
						body: "",
					};
				});

				const fetcher = new FeedFetcher(requester);
				await expect(fetcher.fetchFeed({ url })).rejects.toThrow(UnreachableFeedError);
			});
		});
	});
});
