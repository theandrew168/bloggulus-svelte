export type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E };

export function Ok<T>(data: T): Result<T> {
	return { ok: true, data };
}

export function Err<E = Error>(error: E): Result<never, E> {
	return { ok: false, error };
}

export type Option<T> = { exists: true; data: T } | { exists: false };

export function Some<T>(data: T): Option<T> {
	return { exists: true, data };
}

export function None(): Option<never> {
	return { exists: false };
}

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type Account = {
	id: UUID;
	username: string;
	isAdmin: boolean;
};

export type Article = {
	title: string;
	url: URL;
	blogTitle: string;
	blogURL: URL;
	publishedAt: Date;
	tags: string[];
};

export type Blog = {
	id: UUID;
	title: string;
	siteURL: URL;
	isFollowed: boolean;
};

export type BlogDetails = {
	id: UUID;
	feedURL: URL;
	siteURL: URL;
	title: string;
	syncedAt: Date;
	isPublic: boolean;
};

export type PostDetails = {
	id: UUID;
	blogID: UUID;
	url: URL;
	title: string;
	publishedAt: Date;
};
