import type { UUID } from "node:crypto";

import type { Post } from "../post";

export type PostRepository = {
	// Used for syncing a blog's posts (should this be a query?). We need id and url.
	// listByBlogID: (blogID: UUID) => Promise<Post[]>;
	readByID: (id: UUID) => Promise<Post | undefined>;
	createOrUpdate: (post: Post) => Promise<void>;
	delete: (post: Post) => Promise<void>;
};
