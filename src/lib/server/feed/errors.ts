import { InternalError } from "$lib/server/types/errors";

export class UnreachableFeedError extends InternalError {
	constructor(feedURL: URL, options?: ErrorOptions) {
		super(`Unreachable feed: ${feedURL.toString()}.`, options);
		this.name = "UnreachableFeedError";
	}
}

export class InvalidFeedError extends InternalError {
	constructor(feedURL: URL, options?: ErrorOptions) {
		super(`Invalid feed: ${feedURL.toString()}.`, options);
		this.name = "InvalidFeedError";
	}
}
