import { request as undiciRequest } from "undici";
import type { IncomingHttpHeaders } from "undici/types/header";

import { UnreachableFeedError } from "./errors";

/**
 * HTTP status codes that indicate a redirect. If one of these is encountered
 * when fetching a feed, the fetcher will attempt to follow the redirect.
 */
const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308];

/**
 * Number of times to follow redirects when fetching a feed before giving up.
 * This is to prevent infinite redirect loops.
 */
const MAX_REDIRECT_COUNT = 5;

export type Headers = Record<string, string>;

export type RequestOptions = {
	headers?: Headers;
};

export type Response = {
	url: URL;
	statusCode: number;
	statusText: string;
	headers: Headers;
	body: string;
};

export function isOK(statusCode: number): boolean {
	return statusCode >= 200 && statusCode < 300;
}

type UndiciResponse = Awaited<ReturnType<typeof undiciRequest>>;

/**
 * A simple HTTP client that:
 * - performs requests
 * - follows redirects (up to a certain limit)
 * - normalizes response headers into a simple object
 * - wraps network errors and other unexpected issues in a custom error type
 */
export class Requester {
	/**
	 * Performs an HTTP request and follows redirects.
	 */
	async request(url: URL, opts: RequestOptions = {}): Promise<Response> {
		let currentURL = url;
		let redirectCount = 0;
		let resp: UndiciResponse;

		// Make the initial request.
		try {
			resp = await undiciRequest(currentURL, { headers: opts.headers });
		} catch (error) {
			throw new UnreachableFeedError(currentURL, { cause: error });
		}

		// Follow redirects if necessary.
		while (REDIRECT_STATUS_CODES.includes(resp.statusCode) && redirectCount < MAX_REDIRECT_COUNT) {
			redirectCount++;

			const location = extractHeader(resp.headers, "location");
			if (!location) {
				throw new UnreachableFeedError(currentURL, {
					cause: new Error(`Redirect status code ${resp.statusCode} received without Location header`),
				});
			}

			try {
				currentURL = new URL(location, currentURL);
				resp = await undiciRequest(currentURL, { headers: opts.headers });
			} catch (error) {
				throw new UnreachableFeedError(currentURL, { cause: error });
			}
		}

		const headers: Headers = {};
		for (const key of Object.keys(resp.headers)) {
			const value = extractHeader(resp.headers, key);
			if (value) {
				headers[key.toLowerCase()] = value;
			}
		}

		const body = await resp.body.text();
		return {
			url: currentURL,
			statusCode: resp.statusCode,
			statusText: resp.statusText,
			headers,
			body,
		};
	}
}

function extractHeader(headers: IncomingHttpHeaders, name: string): string | undefined {
	let value = headers[name] ?? headers[name.toLowerCase()];
	if (Array.isArray(value)) {
		value = value[0];
	}

	return value;
}
