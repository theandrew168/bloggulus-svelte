export type Blog = {
	id: string;
	feedUrl: string;
	siteUrl: string;
	title: string;
	syncedAt: Date;
	etag: string | null;
	lastModified: string | null;
};

export type Post = {
	id: string;
	url: string;
	title: string;
	updatedAt: Date;
	body: string | null;
	blogId: string;
};

export type Tag = {
	id: string;
	name: string;
};

/**
 * Post enriched with blog metadata and linked tags
 */
export type PostWithBlogAndTags = Post & {
	blogUrl: string;
	blogTitle: string;
	tags: string[];
};
