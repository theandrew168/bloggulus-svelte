import type { UUID } from "node:crypto";

import type { Account, Article, Blog, BlogDetails, PostDetails } from "$lib/types";

// These queries are specific to the web frontend. If necessary, these could be
// split up by type (article, account, blog, post, etc) or by page (less good?).
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
	// Powers the index page.
	countRelevantArticlesByAccount: (account: Account, search: string) => Promise<number>;
	// Powers the index page (when searching).
	listRelevantArticlesByAccount: (
		account: Account,
		search: string,
		limit: number,
		offset: number,
	) => Promise<Article[]>;

	// Powers authentication middleware.
	readAccountBySessionID: (sessionID: UUID) => Promise<Account | undefined>;
	// Powers the add / follow blogs page.
	listBlogs: (account: Account) => Promise<Blog[]>;

	// Powers the accounts page (admin only).
	listAccounts: () => Promise<Account[]>;
	// Powers the blog details page (admin only).
	readBlogDetailsByID: (blogID: UUID) => Promise<BlogDetails | undefined>;
	// Powers the post details page (admin only).
	readPostDetailsByID: (postID: UUID) => Promise<PostDetails | undefined>;
};
