export class UnreachableFeedError extends Error {
	constructor(feedURL: URL, options?: ErrorOptions) {
		super(`Unreachable feed: ${feedURL.toString()}.`, options);
		this.name = "UnreachableFeedError";
	}
}

export class InvalidFeedError extends Error {
	constructor(feedURL: URL, options?: ErrorOptions) {
		super(`Invalid feed: ${feedURL.toString()}.`, options);
		this.name = "InvalidFeedError";
	}
}
