import type { UUID } from "$lib/types";

export type NewAccountParams = {
	username: string;
};

export type LoadAccountParams = {
	id: UUID;
	username: string;
	isAdmin: boolean;
	followedBlogIDs: Set<UUID>;
	createdAt: Date;
	updatedAt: Date;
	updateVersion: number;
};

export class Account {
	private _id: UUID;
	private _username: string;
	private _isAdmin: boolean;
	private _followedBlogIDs: Set<UUID>;
	private _createdAt: Date;
	private _updatedAt: Date;
	private _updateVersion: number;

	constructor({ username }: NewAccountParams) {
		this._id = crypto.randomUUID();
		this._username = username;
		// TODO: Flip this back to false before production.
		this._isAdmin = true;
		this._followedBlogIDs = new Set();
		this._createdAt = new Date();
		this._updatedAt = new Date();
		this._updateVersion = 1;
	}

	static load({
		id,
		username,
		isAdmin,
		followedBlogIDs,
		createdAt,
		updatedAt,
		updateVersion,
	}: LoadAccountParams): Account {
		const account = new Account({ username });
		account._id = id;
		account._username = username;
		account._isAdmin = isAdmin;
		account._followedBlogIDs = followedBlogIDs;
		account._createdAt = createdAt;
		account._updatedAt = updatedAt;
		account._updateVersion = updateVersion;
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

	get followedBlogIDs(): Set<UUID> {
		return structuredClone(this._followedBlogIDs);
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	get updateVersion(): number {
		return this._updateVersion;
	}

	set updateVersion(updateVersion: number) {
		this._updateVersion = updateVersion;
	}

	followBlog(blogID: UUID): void {
		this._followedBlogIDs.add(blogID);
	}

	unfollowBlog(blogID: UUID): void {
		this._followedBlogIDs.delete(blogID);
	}
}
