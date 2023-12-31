export type Blog = {
	id: string;
	feedUrl: string;
	siteUrl: string;
	title: string;
	etag: string | null;
	lastModified: string | null;
};

export type Post = {
	id: string;
	url: string;
	title: string;
	updatedAt: Date;
	blogId: string;
};

export type Tag = {
	id: string;
	name: string;
};
