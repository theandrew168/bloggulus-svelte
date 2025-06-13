import type { UUID } from "node:crypto";

import type { Post } from "../post";

export type PostRepository = {
	create: (post: Post) => Promise<void>;
	readByID: (id: UUID) => Promise<Post | undefined>;
	// Used for syncing a blog's posts.
	listByBlogID: (blogID: UUID) => Promise<Post[]>;
	update: (post: Post) => Promise<void>;
	delete: (post: Post) => Promise<void>;
};
