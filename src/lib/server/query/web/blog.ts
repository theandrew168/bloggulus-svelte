import type { Account, Blog, BlogDetails, UUID } from "$lib/types";

export type BlogWebQuery = {
	// Powers the blog details page (admin only).
	readDetailsByID: (blogID: UUID) => Promise<BlogDetails | undefined>;
	// Powers the add / follow blogs page.
	readDetailsByFeedURL: (feedURL: string) => Promise<BlogDetails | undefined>;
	// Powers the add / follow blogs page.
	list: (account: Account) => Promise<Blog[]>;
};
