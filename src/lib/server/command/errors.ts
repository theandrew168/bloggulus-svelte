import type { UUID } from "$lib/types";

export class AccountNotFoundError extends Error {
	constructor(accountID: UUID) {
		super(`Account not found with ID: ${accountID}.`);
		this.name = "AccountNotFoundError";
	}
}

export class BlogNotFoundError extends Error {
	constructor(blogID: UUID) {
		super(`Blog not found with ID: ${blogID}.`);
		this.name = "BlogNotFoundError";
	}
}

export class PostNotFoundError extends Error {
	constructor(postID: UUID) {
		super(`Post not found with ID: ${postID}.`);
		this.name = "PostNotFoundError";
	}
}

export class AdminAccountDeletionError extends Error {
	constructor(accountID: UUID) {
		super(`Cannot delete admin account: ${accountID}.`);
		this.name = "AdminAccountDeletionError";
	}
}

export class EmptyFeedError extends Error {
	constructor(feedURL: string) {
		super(`Empty feed: ${feedURL}.`);
		this.name = "EmptyFeedError";
	}
}
