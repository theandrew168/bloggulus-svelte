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
	isPublic: boolean;
	etag?: string;
	lastModified?: string;
	metaCreatedAt: Date;
	metaUpdatedAt: Date;
	metaVersion: number;
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
	private _metaCreatedAt: Date;
	private _metaUpdatedAt: Date;
	private _metaVersion: number;

	constructor({ feedURL, siteURL, title, syncedAt, etag, lastModified }: NewBlogParams) {
		this._id = crypto.randomUUID();
		this._feedURL = feedURL;
		this._siteURL = siteURL;
		this._title = title;
		this._syncedAt = syncedAt;
		this._isPublic = false;
		this._etag = etag;
		this._lastModified = lastModified;
		this._metaCreatedAt = new Date();
		this._metaUpdatedAt = new Date();
		this._metaVersion = 1;
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
		metaCreatedAt,
		metaUpdatedAt,
		metaVersion,
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
		blog._metaCreatedAt = metaCreatedAt;
		blog._metaUpdatedAt = metaUpdatedAt;
		blog._metaVersion = metaVersion;
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

	get syncedAt(): Date {
		return this._syncedAt;
	}

	set syncedAt(syncedAt: Date) {
		this._syncedAt = syncedAt;
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

	canBeSynced(now: Date): boolean {
		const syncCooldownMS = SYNC_COOLDOWN_HOURS * 60 * 60 * 1000;
		return now.getTime() - this._syncedAt.getTime() >= syncCooldownMS;
	}
}
