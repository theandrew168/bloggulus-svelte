import type { UUID } from "$lib/types";

export type NewPostParams = {
	blogID: UUID;
	url: URL;
	title: string;
	publishedAt: Date;
	content?: string;
};

export type LoadPostParams = {
	id: UUID;
	blogID: UUID;
	url: URL;
	title: string;
	publishedAt: Date;
	content?: string;
	metaCreatedAt: Date;
	metaUpdatedAt: Date;
	metaVersion: number;
};

export class Post {
	private _id: UUID;
	private _blogID: UUID;
	private _url: URL;
	private _title: string;
	private _publishedAt: Date;
	private _content?: string;
	private _metaCreatedAt: Date;
	private _metaUpdatedAt: Date;
	private _metaVersion: number;

	constructor({ blogID, url, title, publishedAt, content }: NewPostParams) {
		this._id = crypto.randomUUID();
		this._blogID = blogID;
		this._url = url;
		this._title = title;
		this._publishedAt = publishedAt;
		this._content = content;
		this._metaCreatedAt = new Date();
		this._metaUpdatedAt = new Date();
		this._metaVersion = 1;
	}

	static load({
		id,
		blogID,
		url,
		title,
		publishedAt,
		content,
		metaCreatedAt,
		metaUpdatedAt,
		metaVersion,
	}: LoadPostParams): Post {
		const post = new Post({ blogID, url, title, publishedAt });
		post._id = id;
		post._blogID = blogID;
		post._url = url;
		post._title = title;
		post._publishedAt = publishedAt;
		post._content = content;
		post._metaCreatedAt = metaCreatedAt;
		post._metaUpdatedAt = metaUpdatedAt;
		post._metaVersion = metaVersion;
		return post;
	}

	get id(): UUID {
		return this._id;
	}

	get blogID(): UUID {
		return this._blogID;
	}

	get url(): URL {
		return this._url;
	}

	get title(): string {
		return this._title;
	}

	set title(value: string) {
		this._title = value;
	}

	get publishedAt(): Date {
		return this._publishedAt;
	}

	set publishedAt(publishedAt: Date) {
		this._publishedAt = publishedAt;
	}

	get content(): string | undefined {
		return this._content;
	}

	set content(content: string) {
		this._content = content;
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
}
