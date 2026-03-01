import Chance from "chance";
import { MockAgent, setGlobalDispatcher } from "undici";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { UnreachableFeedError } from "./errors";
import { isOK, Requester } from "./request";

// NOTE: If undici didn't support mocking, we'd have to DI the
// "request" function itself into the Requester class.

describe("feed/request", () => {
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

	describe("request", () => {
		it("should make a GET request and return a valid response", async () => {
			const url = new URL(chance.url());
			const body = chance.sentence();

			const mockPool = mockAgent.get(url.origin);
			mockPool.intercept({ method: "GET", path: url.pathname }).reply(200, body);

			const resp = await new Requester().request(url);
			expect(resp.url.toString()).to.equal(url.toString());
			expect(resp.statusCode).to.equal(200);
			expect(resp.statusText).to.equal("OK");
			expect(resp.body).to.equal(body);
		});

		it("should include headers in the request and response", async () => {
			const url = new URL(chance.url());
			const body = chance.sentence();
			const requestHeaders = {
				"custom-header": chance.word(),
			};
			const responseHeaders = {
				"content-type": "text/plain",
				"custom-response-header": chance.word(),
			};

			const mockPool = mockAgent.get(url.origin);
			mockPool
				.intercept({
					method: "GET",
					path: url.pathname,
					headers: requestHeaders,
				})
				.reply(200, body, { headers: responseHeaders });

			const resp = await new Requester().request(url, { headers: requestHeaders });
			expect(resp.url.toString()).to.equal(url.toString());
			expect(resp.statusCode).to.equal(200);
			expect(resp.statusText).to.equal("OK");
			expect(resp.body).to.equal(body);
			expect(resp.headers["content-type"]).to.equal("text/plain");
			expect(resp.headers["custom-response-header"]).to.equal(responseHeaders["custom-response-header"]);
		});

		it("should follow redirects and return the final response", async () => {
			const url1 = new URL(chance.url());
			const url2 = new URL(chance.url());
			const body = chance.sentence();

			const mockPool1 = mockAgent.get(url1.origin);
			mockPool1.intercept({ method: "GET", path: url1.pathname }).reply(302, "", {
				headers: {
					location: url2.toString(),
				},
			});

			const mockPool2 = mockAgent.get(url2.origin);
			mockPool2.intercept({ method: "GET", path: url2.pathname }).reply(200, body);

			const resp = await new Requester().request(url1);
			expect(resp.url.toString()).to.equal(url2.toString());
			expect(resp.statusCode).to.equal(200);
			expect(resp.statusText).to.equal("OK");
			expect(resp.body).to.equal(body);
		});

		it("should throw an error if the request fails", async () => {
			const url = new URL(chance.url());

			const mockPool = mockAgent.get(url.origin);
			mockPool.intercept({ method: "GET", path: url.pathname }).replyWithError(new Error("Network error"));

			await expect(new Requester().request(url)).rejects.toThrow(UnreachableFeedError);
		});

		it("should throw an error if a redirect response is missing a Location header", async () => {
			const url = new URL(chance.url());

			const mockPool = mockAgent.get(url.origin);
			mockPool.intercept({ method: "GET", path: url.pathname }).reply(302);

			await expect(new Requester().request(url)).rejects.toThrowError(UnreachableFeedError);
		});
	});

	describe("isOK", () => {
		it("should return true for 2xx status codes", () => {
			expect(isOK(200)).to.be.true;
			expect(isOK(204)).to.be.true;
			expect(isOK(299)).to.be.true;
		});

		it("should return false for non-2xx status codes", () => {
			expect(isOK(199)).to.be.false;
			expect(isOK(300)).to.be.false;
			expect(isOK(404)).to.be.false;
			expect(isOK(500)).to.be.false;
		});
	});
});
