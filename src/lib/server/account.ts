import type { UUID } from "$lib/types";

import { Meta } from "./meta";

export type NewAccountParams = {
	username: string;
};

export type LoadAccountParams = {
	id: UUID;
	username: string;
	isAdmin: boolean;
	followedBlogIDs: Set<UUID>;
	meta: Meta;
};

export class Account {
	private _id: UUID;
	private _username: string;
	private _isAdmin: boolean;
	private _followedBlogIDs: Set<UUID>;
	private _meta: Meta;

	constructor({ username }: NewAccountParams) {
		this._id = crypto.randomUUID();
		this._username = username;
		this._isAdmin = false;
		this._followedBlogIDs = new Set();
		this._meta = new Meta();
	}

	static load({ id, username, isAdmin, followedBlogIDs, meta }: LoadAccountParams): Account {
		const account = new Account({ username });
		account._id = id;
		account._username = username;
		account._isAdmin = isAdmin;
		account._followedBlogIDs = followedBlogIDs;
		account._meta = meta;
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

	set isAdmin(isAdmin: boolean) {
		this._isAdmin = isAdmin;
	}

	get followedBlogIDs(): Set<UUID> {
		return structuredClone(this._followedBlogIDs);
	}

	get meta(): Meta {
		return this._meta;
	}

	followBlog(blogID: UUID): void {
		this._followedBlogIDs.add(blogID);
	}

	unfollowBlog(blogID: UUID): void {
		this._followedBlogIDs.delete(blogID);
	}
}
