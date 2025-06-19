import type { UUID } from "$lib/types";

export type NewAccountParams = {
	username: string;
};

export type LoadAccountParams = {
	id: UUID;
	username: string;
	isAdmin: boolean;
	followedBlogIDs: UUID[];
	createdAt: Date;
	updatedAt: Date;
};

export class Account {
	private _id: UUID;
	private _username: string;
	private _isAdmin: boolean;
	private _followedBlogIDs: UUID[];
	private _createdAt: Date;
	private _updatedAt: Date;

	constructor({ username }: NewAccountParams) {
		this._id = crypto.randomUUID();
		this._username = username;
		// TODO: Flip this back to false before production.
		this._isAdmin = true;
		this._followedBlogIDs = [];
		this._createdAt = new Date();
		this._updatedAt = new Date();
	}

	static load({ id, username, isAdmin, followedBlogIDs, createdAt, updatedAt }: LoadAccountParams): Account {
		const account = new Account({ username });
		account._id = id;
		account._username = username;
		account._isAdmin = isAdmin;
		account._followedBlogIDs = followedBlogIDs;
		account._createdAt = createdAt;
		account._updatedAt = updatedAt;
		return account;
	}

	get id(): UUID {
		return this._id;
	}

	get username(): string {
		return this._username;
	}

	get isAdmin(): boolean {
		return this._isAdmin;
	}

	get followedBlogIDs(): UUID[] {
		return structuredClone(this._followedBlogIDs);
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	followBlog(blogID: UUID): void {
		if (this._followedBlogIDs.includes(blogID)) {
			return;
		}

		this._followedBlogIDs.push(blogID);
	}

	unfollowBlog(blogID: UUID): void {
		const index = this._followedBlogIDs.indexOf(blogID);
		if (index === -1) {
			return;
		}

		this._followedBlogIDs.splice(index, 1);
	}
}
