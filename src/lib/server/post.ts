import type { UUID } from "$lib/types";

export type NewPostParams = {
	blogID: UUID;
	url: string;
	title: string;
	publishedAt: Date;
	content?: string;
};

export type LoadPostParams = {
	id: UUID;
	blogID: UUID;
	url: string;
	title: string;
	publishedAt: Date;
	content?: string;
	createdAt: Date;
	updatedAt: Date;
};

export class Post {
	private _id: UUID;
	private _blogID: UUID;
	private _url: string;
	private _title: string;
	private _publishedAt: Date;
	private _content?: string;
	private _createdAt: Date;
	private _updatedAt: Date;

	constructor({ blogID, url, title, publishedAt, content }: NewPostParams) {
		this._id = crypto.randomUUID();
		this._blogID = blogID;
		this._url = url;
		this._title = title;
		this._publishedAt = publishedAt;
		this._content = content;
		this._createdAt = new Date();
		this._updatedAt = new Date();
	}

	static load({ id, blogID, url, title, publishedAt, content, createdAt, updatedAt }: LoadPostParams): Post {
		const post = new Post({ blogID, url, title, publishedAt });
		post._id = id;
		post._blogID = blogID;
		post._url = url;
		post._title = title;
		post._publishedAt = publishedAt;
		post._content = content;
		post._createdAt = createdAt;
		post._updatedAt = updatedAt;
		return post;
	}

	get id(): UUID {
		return this._id;
	}

	get blogID(): UUID {
		return this._blogID;
	}

	get url(): string {
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

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}
}
