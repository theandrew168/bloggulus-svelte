import type { UUID } from "node:crypto";

import type { Account, Article, Blog, BlogDetails, PostDetails } from "$lib/types";

// These queries are specific to the web frontend. If necessary, these could be
// split up by type (article, account, blog, post, etc) or by page (less good?).
export type WebQuery = {
	// Powers the index page.
	listRecentArticles: (limit: number, offset: number) => Promise<Article[]>;
	// Powers the index page.
	listRecentArticlesByAccount: (account: Account, limit: number, offset: number) => Promise<Article[]>;
	// Powers the index page.
	listRelevantArticles: (search: string, limit: number, offset: number) => Promise<Article[]>;
	// Powers the index page.
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
