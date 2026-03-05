import type { UUID } from "$lib/types";

import { Meta } from "./meta";

export const SYNC_COOLDOWN_HOURS = 2;

export type NewBlogParams = {
	feedURL: URL;
	siteURL: URL;
	title: string;
	syncedAt: Date;
	etag?: string;
	lastModified?: string;
	cachedUntil?: Date;
};

export type LoadBlogParams = {
	id: UUID;
	feedURL: URL;
	siteURL: URL;
	title: string;
	syncedAt: Date;
	isPublic: boolean;
	etag?: string;
	lastModified?: string;
	cachedUntil?: Date;
	meta: Meta;
};

export class Blog {
	private _id: UUID;
	private _feedURL: URL;
	private _siteURL: URL;
	private _title: string;
	private _syncedAt: Date;
	private _isPublic: boolean;
	private _etag?: string;
	private _lastModified?: string;
	private _cachedUntil?: Date;
	private _meta: Meta;

	constructor({ feedURL, siteURL, title, syncedAt, etag, lastModified, cachedUntil }: NewBlogParams) {
		this._id = crypto.randomUUID();
		this._feedURL = feedURL;
		this._siteURL = siteURL;
		this._title = title;
		this._syncedAt = syncedAt;
		this._isPublic = false;
		this._etag = etag;
		this._lastModified = lastModified;
		this._cachedUntil = cachedUntil;
		this._meta = new Meta();
	}

	static load({
		id,
		feedURL,
		siteURL,
		title,
		syncedAt,
		isPublic,
		etag,
		lastModified,
		cachedUntil,
		meta,
	}: LoadBlogParams): Blog {
		const blog = new Blog({ feedURL, siteURL, title, syncedAt });
		blog._id = id;
		blog._feedURL = feedURL;
		blog._siteURL = siteURL;
		blog._title = title;
		blog._syncedAt = syncedAt;
		blog._isPublic = isPublic;
		blog._etag = etag;
		blog._lastModified = lastModified;
		blog._cachedUntil = cachedUntil;
		blog._meta = meta;
		return blog;
	}

	get id(): UUID {
		return this._id;
	}

	get feedURL(): URL {
		return this._feedURL;
	}

	set feedURL(feedURL: URL) {
		this._feedURL = feedURL;
	}

	get siteURL(): URL {
		return this._siteURL;
	}

	get title(): string {
		return this._title;
	}

	get syncedAt(): Date {
		return this._syncedAt;
	}

	set syncedAt(syncedAt: Date) {
		this._syncedAt = syncedAt;
	}

	get isPublic(): boolean {
		return this._isPublic;
	}

	set isPublic(isPublic: boolean) {
		this._isPublic = isPublic;
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

	get cachedUntil(): Date | undefined {
		return this._cachedUntil;
	}

	set cachedUntil(cachedUntil: Date) {
		this._cachedUntil = cachedUntil;
	}

	get meta(): Meta {
		return this._meta;
	}

	canBeSynced(now: Date): boolean {
		if (this._cachedUntil && now < this._cachedUntil) {
			return false;
		}

		const syncCooldownMS = SYNC_COOLDOWN_HOURS * 60 * 60 * 1000;
		const timeSinceLastSyncMS = now.getTime() - this._syncedAt.getTime();
		return timeSinceLastSyncMS >= syncCooldownMS;
	}
}
