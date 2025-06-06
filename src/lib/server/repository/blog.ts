import type { UUID } from "node:crypto";

import type { Blog } from "../blog";

export type BlogRepository = {
	// Used for syncing blogs.
	// list: () => Promise<Blog[]>;
	readByID: (id: UUID) => Promise<Blog | undefined>;
	readByFeedURL: (feedURL: string) => Promise<Blog | undefined>;
	createOrUpdate: (blog: Blog) => Promise<void>;
	delete: (blog: Blog) => Promise<void>;
};
