import type { UUID } from "$lib/types";

export const SYNC_COOLDOWN_HOURS = 2;

export type NewBlogParams = {
	feedURL: URL;
	siteURL: URL;
	title: string;
	syncedAt: Date;
	etag?: string;
	lastModified?: string;
};

export type LoadBlogParams = {
	id: UUID;
	feedURL: URL;
	siteURL: URL;
	title: string;
	syncedAt: Date;
	etag?: string;
	lastModified?: string;
	createdAt: Date;
	updatedAt: Date;
	updateVersion: number;
};

export class Blog {
	private _id: UUID;
	private _feedURL: URL;
	private _siteURL: URL;
	private _title: string;
	private _syncedAt: Date;
	private _etag?: string;
	private _lastModified?: string;
	private _createdAt: Date;
	private _updatedAt: Date;
	private _updateVersion: number;

	constructor({ feedURL, siteURL, title, syncedAt, etag, lastModified }: NewBlogParams) {
		this._id = crypto.randomUUID();
		this._feedURL = feedURL;
		this._siteURL = siteURL;
		this._title = title;
		this._syncedAt = syncedAt;
		this._etag = etag;
		this._lastModified = lastModified;
		this._createdAt = new Date();
		this._updatedAt = new Date();
		this._updateVersion = 1;
	}

	static load({
		id,
		feedURL,
		siteURL,
		title,
		syncedAt,
		etag,
		lastModified,
		createdAt,
		updatedAt,
		updateVersion,
	}: LoadBlogParams): Blog {
		const blog = new Blog({ feedURL, siteURL, title, syncedAt });
		blog._id = id;
		blog._feedURL = feedURL;
		blog._siteURL = siteURL;
		blog._title = title;
		blog._syncedAt = syncedAt;
		blog._etag = etag;
		blog._lastModified = lastModified;
		blog._createdAt = createdAt;
		blog._updatedAt = updatedAt;
		blog._updateVersion = updateVersion;
		return blog;
	}

	get id(): UUID {
		return this._id;
	}

	get feedURL(): URL {
		return this._feedURL;
	}

	get siteURL(): URL {
		return this._siteURL;
	}

	get title(): string {
		return this._title;
	}

	get etag(): string | undefined {
		return this._etag;
	}

	set etag(etag: string) {
		this._etag = etag;
	}

	get lastModified(): string | undefined {
		return this._lastModified;
	}

	set lastModified(lastModified: string) {
		this._lastModified = lastModified;
	}

	get syncedAt(): Date {
		return this._syncedAt;
	}

	set syncedAt(syncedAt: Date) {
		this._syncedAt = syncedAt;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	set updatedAt(updatedAt: Date) {
		this._updatedAt = updatedAt;
	}

	get updateVersion(): number {
		return this._updateVersion;
	}

	set updateVersion(updateVersion: number) {
		this._updateVersion = updateVersion;
	}

	canBeSynced(now: Date): boolean {
		const syncCooldownMS = SYNC_COOLDOWN_HOURS * 60 * 60 * 1000;
		return now.getTime() - this._syncedAt.getTime() >= syncCooldownMS;
	}
}
