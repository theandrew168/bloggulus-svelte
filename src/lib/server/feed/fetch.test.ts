import Chance from "chance";
import fetchMock from "fetch-mock";
import { describe, expect, it } from "vitest";

import { UnreachableFeedError } from "./errors";
import { FeedFetcher } from "./fetch";

describe("feed/fetch", () => {
	const chance = new Chance();

	describe("FeedFetcher", () => {
		describe("fetchFeed", () => {
			it("should fetch a feed and return its content, etag, and last modified", async () => {
				const url = new URL(chance.url());
				const feed = "<feed>Example Feed</feed>";
				const etag = chance.word();
				const lastModified = chance.date().toISOString();

				const fetch = fetchMock.createInstance();
				fetch.get(url, {
					status: 200,
					body: feed,
					headers: {
						"Content-Type": "application/xml",
						ETag: etag,
						"Last-Modified": lastModified,
					},
				});

				const fetcher = new FeedFetcher(fetch.fetchHandler);
				const response = await fetcher.fetchFeed({ url });

				expect(response.feed).to.equal(feed);
				expect(response.etag).to.equal(etag);
				expect(response.lastModified).to.equal(lastModified);
			});

			it("should include etag and last modified headers if present", async () => {
				const url = new URL(chance.url());
				const feed = "<feed>Example Feed</feed>";

				const fetch = fetchMock.createInstance();
				fetch.get(url, {
					status: 200,
					body: feed,
				});

				const etag = chance.word();
				const lastModified = chance.date().toISOString();

				const fetcher = new FeedFetcher(fetch.fetchHandler);
				await fetcher.fetchFeed({ url, etag, lastModified });

				const reqHeaders = (fetch.callHistory.lastCall()?.options?.headers ?? {}) as Record<string, string>;
				expect(reqHeaders["if-none-match"]).to.equal(etag);
				expect(reqHeaders["if-modified-since"]).to.equal(lastModified);
			});

			it("should return an empty feed for 304 Not Modified responses", async () => {
				const url = new URL(chance.url());
				const etag = chance.word();
				const lastModified = chance.date().toISOString();

				const fetch = fetchMock.createInstance();
				fetch.get(url, {
					status: 304,
					headers: {
						ETag: etag,
						"Last-Modified": lastModified,
					},
				});

				const fetcher = new FeedFetcher(fetch.fetchHandler);
				const response = await fetcher.fetchFeed({ url });

				expect(response.feed).to.be.undefined;
				expect(response.etag).to.equal(etag);
				expect(response.lastModified).to.equal(lastModified);
			});

			it("should throw an UnreachableFeedError for network errors", async () => {
				const url = new URL(chance.url());

				const fetch = fetchMock.createInstance();
				fetch.get(url, {
					throws: new Error("Network error"),
				});

				const fetcher = new FeedFetcher(fetch.fetchHandler);
				await expect(fetcher.fetchFeed({ url })).rejects.toThrow(UnreachableFeedError);
			});

			it("should throw an UnreachableFeedError for non-2xx, non-304 responses", async () => {
				const url = new URL(chance.url());

				const fetch = fetchMock.createInstance();
				fetch.get(url, {
					status: 404,
				});

				const fetcher = new FeedFetcher(fetch.fetchHandler);
				await expect(fetcher.fetchFeed({ url })).rejects.toThrow(UnreachableFeedError);
			});
		});
	});
});
