import Chance from "chance";
import { MockAgent, setGlobalDispatcher } from "undici";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { UnreachableFeedError } from "./errors";
import { FeedFetcher } from "./fetch";

describe("feed/fetch", () => {
	const chance = new Chance();

	let mockAgent: MockAgent;

	beforeAll(() => {
		mockAgent = new MockAgent();
		mockAgent.disableNetConnect();
		setGlobalDispatcher(mockAgent);
	});

	afterAll(async () => {
		await mockAgent.close();
	});

	describe("FeedFetcher", () => {
		describe("fetchFeed", () => {
			it("should fetch a feed and return its content, etag, and last modified", async () => {
				const url = new URL(chance.url());
				const origin = `${url.protocol}//${url.host}`;
				const path = `${url.pathname}${url.search}`;
				const feed = "<feed>Example Feed</feed>";
				const etag = chance.word();
				const lastModified = chance.date().toISOString();

				const mockPool = mockAgent.get(origin);
				mockPool.intercept({ method: "GET", path }).reply(200, feed, {
					headers: {
						"Content-Type": "application/xml",
						ETag: etag,
						"last-modified": lastModified,
					},
				});

				const fetcher = new FeedFetcher();
				const response = await fetcher.fetchFeed({ url });

				expect(response.feed).to.equal(feed);
				expect(response.etag).to.equal(etag);
				expect(response.lastModified).to.equal(lastModified);
			});

			it("should include etag and last modified headers if present", async () => {
				const url = new URL(chance.url());
				const origin = `${url.protocol}//${url.host}`;
				const path = `${url.pathname}${url.search}`;
				const feed = "<feed>Example Feed</feed>";

				const etag = chance.word();
				const lastModified = chance.date().toISOString();

				const mockPool = mockAgent.get(origin);
				mockPool
					.intercept({
						method: "GET",
						path,
						headers: {
							"if-none-match": etag,
							"if-modified-since": lastModified,
						},
					})
					.reply(200, feed);

				const fetcher = new FeedFetcher();
				await fetcher.fetchFeed({ url, etag, lastModified });
			});

			it("should return an empty feed for 304 Not Modified responses", async () => {
				const url = new URL(chance.url());
				const origin = `${url.protocol}//${url.host}`;
				const path = `${url.pathname}${url.search}`;
				const etag = chance.word();
				const lastModified = chance.date().toISOString();

				const mockPool = mockAgent.get(origin);
				mockPool.intercept({ method: "GET", path }).reply(304, "", {
					headers: {
						ETag: etag,
						"Last-Modified": lastModified,
					},
				});

				const fetcher = new FeedFetcher();
				const response = await fetcher.fetchFeed({ url });

				expect(response.feed).to.be.undefined;
				expect(response.etag).to.equal(etag);
				expect(response.lastModified).to.equal(lastModified);
			});

			it("should throw an UnreachableFeedError for network errors", async () => {
				const url = new URL(chance.url());
				const origin = `${url.protocol}//${url.host}`;
				const path = `${url.pathname}${url.search}`;

				const mockPool = mockAgent.get(origin);
				mockPool.intercept({ method: "GET", path }).replyWithError(new Error("Network error"));

				const fetcher = new FeedFetcher();
				await expect(fetcher.fetchFeed({ url })).rejects.toThrow(UnreachableFeedError);
			});

			it("should throw an UnreachableFeedError for non-2xx, non-304 responses", async () => {
				const url = new URL(chance.url());
				const origin = `${url.protocol}//${url.host}`;
				const path = `${url.pathname}${url.search}`;

				const mockPool = mockAgent.get(origin);
				mockPool.intercept({ method: "GET", path }).reply(404, "");

				const fetcher = new FeedFetcher();
				await expect(fetcher.fetchFeed({ url })).rejects.toThrow(UnreachableFeedError);
			});
		});
	});
});
