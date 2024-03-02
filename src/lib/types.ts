// In an ideal world, these types would use optional fields instead of nullable.
// However, since I'm returning these types directly from the storage layer,
// empty values will actually be null. The "right" thing to do would probably be
// to create FooRow types that are typed with "| null" and then convert to optionals
// before returning. Or if I was rolling with a more DDD approach, I'd convert those
// FooRow types to rich domain objects.

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
	blogId: string;
	blogUrl: string;
	blogTitle: string;
	tags: string[];
};
