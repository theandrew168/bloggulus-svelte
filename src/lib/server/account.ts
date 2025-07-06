import type { UUID } from "$lib/types";

export type NewAccountParams = {
	username: string;
};

export type LoadAccountParams = {
	id: UUID;
	username: string;
	isAdmin: boolean;
	followedBlogIDs: Set<UUID>;
	metaCreatedAt: Date;
	metaUpdatedAt: Date;
	metaVersion: number;
};

export class Account {
	private _id: UUID;
	private _username: string;
	private _isAdmin: boolean;
	private _followedBlogIDs: Set<UUID>;
	private _metaCreatedAt: Date;
	private _metaUpdatedAt: Date;
	private _metaVersion: number;

	constructor({ username }: NewAccountParams) {
		this._id = crypto.randomUUID();
		this._username = username;
		this._isAdmin = false;
		this._followedBlogIDs = new Set();
		this._metaCreatedAt = new Date();
		this._metaUpdatedAt = new Date();
		this._metaVersion = 1;
	}

	static load({
		id,
		username,
		isAdmin,
		followedBlogIDs,
		metaCreatedAt,
		metaUpdatedAt,
		metaVersion,
	}: LoadAccountParams): Account {
		const account = new Account({ username });
		account._id = id;
		account._username = username;
		account._isAdmin = isAdmin;
		account._followedBlogIDs = followedBlogIDs;
		account._metaCreatedAt = metaCreatedAt;
		account._metaUpdatedAt = metaUpdatedAt;
		account._metaVersion = metaVersion;
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

	get metaCreatedAt(): Date {
		return this._metaCreatedAt;
	}

	get metaUpdatedAt(): Date {
		return this._metaUpdatedAt;
	}

	set metaUpdatedAt(metaUpdatedAt: Date) {
		this._metaUpdatedAt = metaUpdatedAt;
	}

	get metaVersion(): number {
		return this._metaVersion;
	}

	set metaVersion(metaVersion: number) {
		this._metaVersion = metaVersion;
	}

	followBlog(blogID: UUID): void {
		this._followedBlogIDs.add(blogID);
	}

	unfollowBlog(blogID: UUID): void {
		this._followedBlogIDs.delete(blogID);
	}
}
