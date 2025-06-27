export class UnreachableFeedError extends Error {
	constructor(feedURL: string, options?: ErrorOptions) {
		super(`Unreachable feed: ${feedURL}.`, options);
		this.name = "UnreachableFeedError";
	}
}

export class InvalidFeedError extends Error {
	constructor(feedURL: string, options?: ErrorOptions) {
		super(`Invalid feed: ${feedURL}.`, options);
		this.name = "InvalidFeedError";
	}
}
