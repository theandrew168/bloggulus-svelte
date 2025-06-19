import type { UUID } from "$lib/types";

import type { Blog } from "../blog";

export type BlogRepository = {
	create: (blog: Blog) => Promise<void>;
	readByID: (id: UUID) => Promise<Blog | undefined>;
	readByFeedURL: (feedURL: string) => Promise<Blog | undefined>;
	// Used for syncing blogs.
	list: () => Promise<Blog[]>;
	update: (blog: Blog) => Promise<void>;
	delete: (blog: Blog) => Promise<void>;
};
