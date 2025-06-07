import type { UUID } from "node:crypto";

import type { Blog } from "../blog";

export type BlogRepository = {
	createOrUpdate: (blog: Blog) => Promise<void>;
	readByID: (id: UUID) => Promise<Blog | undefined>;
	readByFeedURL: (feedURL: string) => Promise<Blog | undefined>;
	// Used for syncing blogs.
	list: () => Promise<Blog[]>;
	delete: (blog: Blog) => Promise<void>;
};
