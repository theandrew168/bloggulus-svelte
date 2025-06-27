// NOTE: The URLs in the types below could be replaced with full `URL`s once
// devalue supports it (can properly serialize / deserialize them):
// https://github.com/Rich-Harris/devalue/pull/92

export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type Account = {
	id: UUID;
	username: string;
	isAdmin: boolean;
};

export type Article = {
	title: string;
	url: string;
	blogTitle: string;
	blogURL: string;
	publishedAt: Date;
	tags: string[];
};

export type Blog = {
	id: UUID;
	title: string;
	siteURL: string;
	isFollowed: boolean;
};

export type BlogDetails = {
	id: UUID;
	feedURL: string;
	siteURL: string;
	title: string;
	syncedAt: Date;
};

export type PostDetails = {
	id: UUID;
	blogID: UUID;
	url: string;
	title: string;
	publishedAt: Date;
};
