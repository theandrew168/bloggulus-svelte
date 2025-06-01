import { randomUUID, type UUID } from "node:crypto";

export const SyncCooldownMS = 2 * 60 * 60 * 1000;

export type NewBlogParams = {
	feedURL: URL;
	siteURL: URL;
	title: string;
};

export type LoadBlogParams = {
	id: UUID;
	feedURL: URL;
	siteURL: URL;
	title: string;
	etag?: string;
	lastModified?: string;
	syncedAt?: Date;
};

export class Blog {
	private _id: UUID;
	private _feedURL: URL;
	private _siteURL: URL;
	private _title: string;
	private _etag?: string;
	private _lastModified?: string;
	private _syncedAt?: Date;

	constructor({ feedURL, siteURL, title }: NewBlogParams) {
		this._id = randomUUID();
		this._feedURL = feedURL;
		this._siteURL = siteURL;
		this._title = title;
	}

	static load({ id, feedURL, siteURL, title, etag, lastModified, syncedAt }: LoadBlogParams): Blog {
		const blog = new Blog({ feedURL, siteURL, title });
		blog._id = id;
		blog._feedURL = feedURL;
		blog._siteURL = siteURL;
		blog._title = title;
		blog._etag = etag;
		blog._lastModified = lastModified;
		blog._syncedAt = syncedAt;
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

	canBeSynced(now: Date): boolean {
		if (!this._syncedAt) {
			return true;
		}

		return now.getTime() - this._syncedAt.getTime() >= SyncCooldownMS;
	}
}
