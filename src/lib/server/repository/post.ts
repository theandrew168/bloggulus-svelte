import type { UUID } from "node:crypto";

import type { Post } from "../post";

export type PostRepository = {
	createOrUpdate: (post: Post) => Promise<void>;
	readByID: (id: UUID) => Promise<Post | undefined>;
	// Used for syncing a blog's posts.
	listByBlogID: (blogID: UUID) => Promise<Post[]>;
	delete: (post: Post) => Promise<void>;
};
