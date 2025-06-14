import type { UUID } from "node:crypto";

import type { Account, Article, Blog, BlogDetails, PostDetails } from "$lib/types";

// TODO: For a large project, would this get out of hand? What is an alternative?
// Do I just cut the abstraction and let UIs make their own queries? While that'd
// be less code, it'd make it difficult to change the underlying data model. Maybe
// I wanna do some caching, add CDC, or even use a different database. If the
// queries are all in one place, I can do that without having to change the UIs.

// TODO: Break these out by type, rename web.ts to index.ts, impl each in subdir like repos.

// These queries are specific to the web frontend. If necessary, these could be
// split up by type (article, account, blog, post, etc) or by page (less good?).
// Some queries could be used across multiple pages (like basic account info).
export type WebQuery = {
	// Powers the index page.
	countRecentArticles: () => Promise<number>;
	// Powers the index page.
	listRecentArticles: (limit: number, offset: number) => Promise<Article[]>;
	// Powers the index page.
	countRecentArticlesByAccount: (account: Account) => Promise<number>;
	// Powers the index page.
	listRecentArticlesByAccount: (account: Account, limit: number, offset: number) => Promise<Article[]>;

	// Powers the index page (when searching).
	countRelevantArticles: (search: string) => Promise<number>;
	// Powers the index page (when searching).
	listRelevantArticles: (search: string, limit: number, offset: number) => Promise<Article[]>;
	// Powers the index page (when searching).
	countRelevantArticlesByAccount: (account: Account, search: string) => Promise<number>;
	// Powers the index page (when searching).
	listRelevantArticlesByAccount: (
		account: Account,
		search: string,
		limit: number,
		offset: number,
	) => Promise<Article[]>;

	// Powers authentication middleware.
	readAccountBySessionToken: (sessionToken: string) => Promise<Account | undefined>;
	// Powers the add / follow blogs page.
	listBlogs: (account: Account) => Promise<Blog[]>;

	// Powers the accounts page (admin only).
	listAccounts: () => Promise<Account[]>;
	// Powers the blog details page (admin only).
	readBlogDetailsByID: (blogID: UUID) => Promise<BlogDetails | undefined>;
	// Powers the post details page (admin only).
	readPostDetailsByID: (postID: UUID) => Promise<PostDetails | undefined>;
};
