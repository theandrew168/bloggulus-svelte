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
