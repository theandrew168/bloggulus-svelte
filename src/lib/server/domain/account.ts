import { randomUUID, type UUID } from "node:crypto";

export type NewAccountParams = {
	username: string;
};

export type LoadAccountParams = {
	id: UUID;
	username: string;
	isAdmin: boolean;
	followedBlogIDs: UUID[];
};

export class Account {
	private _id: UUID;
	private _username: string;
	private _isAdmin: boolean;
	private _followedBlogIDs: UUID[];

	constructor({ username }: NewAccountParams) {
		this._id = randomUUID();
		this._username = username;
		this._isAdmin = false;
		this._followedBlogIDs = [];
	}

	static load({ id, username, isAdmin, followedBlogIDs }: LoadAccountParams): Account {
		const account = new Account({ username });
		account._id = id;
		account._username = username;
		account._isAdmin = isAdmin;
		account._followedBlogIDs = followedBlogIDs;
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
