import { randomUUID, type UUID } from "node:crypto";

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
};

export class Post {
	private _id: UUID;
	private _blogID: UUID;
	private _url: URL;
	private _title: string;
	private _publishedAt: Date;
	private _content?: string;

	constructor({ blogID, url, title, publishedAt, content }: NewPostParams) {
		this._id = randomUUID();
		this._blogID = blogID;
		this._url = url;
		this._title = title;
		this._publishedAt = publishedAt;
		this._content = content;
	}

	static load({ id, blogID, url, title, publishedAt, content }: LoadPostParams): Post {
		const post = new Post({ blogID, url, title, publishedAt });
		post._id = id;
		post._blogID = blogID;
		post._url = url;
		post._title = title;
		post._publishedAt = publishedAt;
		post._content = content;
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

	set publishedAt(value: Date) {
		this._publishedAt = value;
	}

	get content(): string | undefined {
		return this._content;
	}

	set content(value: string) {
		this._content = value;
	}
}
