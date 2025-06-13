import { randomUUID, type UUID } from "node:crypto";

const SYNC_COOLDOWN_MS = 2 * 60 * 60 * 1000;

export type NewBlogParams = {
	feedURL: string;
	siteURL: string;
	title: string;
	etag?: string;
	lastModified?: string;
	syncedAt?: Date;
};

export type LoadBlogParams = {
	id: UUID;
	feedURL: string;
	siteURL: string;
	title: string;
	etag?: string;
	lastModified?: string;
	syncedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
};

export class Blog {
	private _id: UUID;
	private _feedURL: string;
	private _siteURL: string;
	private _title: string;
	private _etag?: string;
	private _lastModified?: string;
	private _syncedAt?: Date;
	private _createdAt: Date;
	private _updatedAt: Date;

	constructor({ feedURL, siteURL, title, etag, lastModified, syncedAt }: NewBlogParams) {
		this._id = randomUUID();
		this._feedURL = feedURL;
		this._siteURL = siteURL;
		this._title = title;
		this._etag = etag;
		this._lastModified = lastModified;
		this._syncedAt = syncedAt;
		this._createdAt = new Date();
		this._updatedAt = new Date();
	}

	static load({
		id,
		feedURL,
		siteURL,
		title,
		etag,
		lastModified,
		syncedAt,
		createdAt,
		updatedAt,
	}: LoadBlogParams): Blog {
		const blog = new Blog({ feedURL, siteURL, title });
		blog._id = id;
		blog._feedURL = feedURL;
		blog._siteURL = siteURL;
		blog._title = title;
		blog._etag = etag;
		blog._lastModified = lastModified;
		blog._syncedAt = syncedAt;
		blog._createdAt = createdAt;
		blog._updatedAt = updatedAt;
		return blog;
	}

	get id(): UUID {
		return this._id;
	}

	get feedURL(): string {
		return this._feedURL;
	}

	get siteURL(): string {
		return this._siteURL;
	}

	get title(): string {
		return this._title;
	}

	get etag(): string | undefined {
		return this._etag;
	}

	set etag(value: string) {
		this._etag = value;
	}

	get lastModified(): string | undefined {
		return this._lastModified;
	}

	set lastModified(value: string) {
		this._lastModified = value;
	}

	get syncedAt(): Date | undefined {
		return this._syncedAt;
	}

	set syncedAt(value: Date) {
		this._syncedAt = value;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	canBeSynced(now: Date): boolean {
		if (!this._syncedAt) {
			return true;
		}

		return now.getTime() - this._syncedAt.getTime() >= SYNC_COOLDOWN_MS;
	}
}
