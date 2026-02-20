import { InternalError } from "$lib/server/types/errors";
import type { UUID } from "$lib/types";

export class AccountNotFoundError extends InternalError {
	constructor(accountID: UUID) {
		super(`Account not found with ID: ${accountID}.`);
		this.name = "AccountNotFoundError";
	}
}

export class BlogNotFoundError extends InternalError {
	constructor(blogID: UUID) {
		super(`Blog not found with ID: ${blogID}.`);
		this.name = "BlogNotFoundError";
	}
}

export class PostNotFoundError extends InternalError {
	constructor(postID: UUID) {
		super(`Post not found with ID: ${postID}.`);
		this.name = "PostNotFoundError";
	}
}

export class AdminAccountDeletionError extends InternalError {
	constructor(accountID: UUID) {
		super(`Cannot delete admin account: ${accountID}.`);
		this.name = "AdminAccountDeletionError";
	}
}

export class EmptyFeedError extends InternalError {
	constructor(feedURL: URL) {
		super(`Empty feed: ${feedURL.toString()}.`);
		this.name = "EmptyFeedError";
	}
}
