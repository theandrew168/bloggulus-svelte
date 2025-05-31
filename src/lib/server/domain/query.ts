import type { UUID } from "node:crypto";

import type { Account } from "./account";
import type { AccountRepository, BlogRepository, PostRepository, SessionRepository } from "./repository";

export type Article = {
	title: string;
	url: URL;
	blogTitle: string;
	blogURL: URL;
	publishedAt: Date;
	tags: string[];
};

// Powers the index page.
async function listRecentArticles(): Promise<Article[]> {
	return [];
}

// Powers the index page.
async function listRecentArticlesForAccount(account: Account): Promise<Article[]> {
	return [];
}

// Powers the index page.
async function listRelevantArticles(search: string): Promise<Article[]> {
	return [];
}

// Powers the index page.
async function listRelevantArticlesForAccount(search: string, account: Account): Promise<Article[]> {
	return [];
}

// Powers the accounts page (admin only).
async function listAccounts(): Promise<Account[]> {
	return [];
}

// Powers authentication middleware.
async function findAccountBySessionID(
	accountRepo: AccountRepository,
	sessionRepo: SessionRepository,
	sessionID: UUID,
): Promise<Account | undefined> {
	const session = await sessionRepo.readByID(sessionID);
	if (!session) {
		return undefined;
	}

	return accountRepo.readByID(session.accountID);
}

export type BlogDetails = {
	id: UUID;
	feedURL: string;
	siteURL: string;
	title: string;
	syncedAt?: Date;
};

// Powers the blog details page (admin only).
async function readBlogDetailsByID(blogRepo: BlogRepository, blogID: UUID): Promise<BlogDetails | undefined> {
	return undefined;
}

export type PostDetails = {
	id: UUID;
	blogID: UUID;
	url: string;
	title: string;
	publishedAt: Date;
};

// Powers the post details page (admin only).
async function readPostDetailsByID(postRepo: PostRepository, postID: UUID): Promise<PostDetails | undefined> {
	return undefined;
}

export type BlogForAccount = {
	id: UUID;
	title: string;
	siteURL: URL;
	isFollowed: boolean;
};

// Powers the add / follow blogs page.
async function listBlogsForAccount(blogRepo: BlogRepository, account: Account): Promise<BlogForAccount[]> {
	const blogs = await blogRepo.list();
	return blogs.map((blog) => ({
		id: blog.id,
		title: blog.title,
		siteURL: blog.siteURL,
		isFollowed: account.followedBlogIDs.includes(blog.id),
	}));
}
