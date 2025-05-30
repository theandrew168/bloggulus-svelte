import type { Account, Blog, BlogID, Post, PostID, SessionID, Tag } from "./model";
import type { AccountRepository, BlogRepository, PostRepository, SessionRepository } from "./repository";

type Article = {
	title: string;
	url: URL;
	blogTitle: string;
	blogURL: URL;
	publishedAt: Date;
	tags: Tag[];
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
	sessionID: SessionID,
): Promise<Account | undefined> {
	const session = await sessionRepo.readByID(sessionID);
	if (!session) {
		return undefined;
	}

	return accountRepo.readByID(session.accountID);
}

// Powers the blog details page (admin only).
async function readBlogByID(blogRepo: BlogRepository, blogID: BlogID): Promise<Blog | undefined> {
	return blogRepo.readByID(blogID);
}

// Powers the post details page (admin only).
async function readPostByID(postRepo: PostRepository, postID: PostID): Promise<Post | undefined> {
	return postRepo.readByID(postID);
}

type BlogForAccount = {
	id: BlogID;
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
		isFollowed: account.followedBlogs.includes(blog.id),
	}));
}
