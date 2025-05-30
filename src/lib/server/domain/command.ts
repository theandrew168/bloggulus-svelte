import { randomUUID } from "node:crypto";

import type { FeedFetcher, FeedParser, FeedPost } from "./feed";
import type { AccountID, Blog, BlogID, Post, PostID, Session, SessionID } from "./model";
import type { AccountRepository, BlogRepository, PostRepository, SessionRepository } from "./repository";

// Should run periodically to sync all blogs and their posts.
async function syncAllBlogs(
	blogRepo: BlogRepository,
	postRepo: PostRepository,
	feedFetcher: FeedFetcher,
	feedParser: FeedParser,
): Promise<void> {
	const blogs = await blogRepo.list();
	await Promise.all(blogs.map((blog) => addOrSyncBlog(blogRepo, postRepo, feedFetcher, feedParser, blog.feedURL)));
}

// Should run periodically to delete expired sessions.
async function deleteExpiredSessions(sessionRepo: SessionRepository): Promise<void> {
	const sessions = await sessionRepo.listExpired(new Date());
	await Promise.all(sessions.map((session) => sessionRepo.delete(session)));
}

async function addOrSyncBlog(
	blogRepo: BlogRepository,
	postRepo: PostRepository,
	feedFetcher: FeedFetcher,
	feedParser: FeedParser,
	feedURL: URL,
): Promise<void> {
	const feed = await feedFetcher.fetchFeed(feedURL);
	if (!feed) {
		// No feed content returned
		return;
	}

	const feedBlog = await feedParser.parseFeed(feedURL, feed);
	if (!feedBlog) {
		// Feed parsing failed
		return;
	}

	let existingBlog = await blogRepo.readByFeedURL(feedURL);
	if (!existingBlog) {
		existingBlog = {
			id: randomUUID(),
			title: feedBlog.title,
			feedURL: feedBlog.feedURL,
			siteURL: feedBlog.siteURL,
		};
		await blogRepo.createOrUpdate(existingBlog);
	}

	const existingPosts = await postRepo.listByBlogID(existingBlog.id);
	const { postsToCreate, postsToUpdate } = comparePosts(existingBlog, existingPosts, feedBlog.posts);

	for (const post of postsToCreate) {
		await postRepo.createOrUpdate(post);
	}
	for (const post of postsToUpdate) {
		await postRepo.createOrUpdate(post);
	}
}

function comparePosts(
	blog: Blog,
	knownPosts: Post[],
	feedPosts: FeedPost[],
): { postsToCreate: Post[]; postsToUpdate: Post[] } {
	const knownPostsByURL: Record<string, Post> = {};
	for (const post of knownPosts) {
		knownPostsByURL[post.url.toString()] = post;
	}

	const postsToCreate: Post[] = [];
	const postsToUpdate: Post[] = [];

	for (const feedPost of feedPosts) {
		const knownPost = knownPostsByURL[feedPost.url.toString()];
		if (!knownPost) {
			postsToCreate.push({
				id: randomUUID(),
				blogID: blog.id,
				url: feedPost.url,
				title: feedPost.title,
				content: feedPost.content || "",
				publishedAt: feedPost.publishedAt,
			});
		} else {
			// TODO: Check if the post needs to be updated
			postsToUpdate.push(knownPost);
		}
	}

	return { postsToCreate, postsToUpdate };
}

async function signIn(
	accountRepo: AccountRepository,
	sessionRepo: SessionRepository,
	username: string,
): Promise<Session> {
	let account = await accountRepo.readByUsername(username);
	if (!account) {
		account = {
			id: randomUUID(),
			username: username,
			isAdmin: false,
			followedBlogs: [],
		};
		await accountRepo.createOrUpdate(account);
	}

	const session: Session = {
		id: randomUUID(),
		accountID: account.id,
		expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
	};
	await sessionRepo.createOrUpdate(session);

	return session;
}

async function signOut(sessionRepo: SessionRepository, sessionID: SessionID): Promise<void> {
	const session = await sessionRepo.readByID(sessionID);
	if (!session) {
		return;
	}

	await sessionRepo.delete(session);
}

async function deleteAccount(accountRepo: AccountRepository, accountID: AccountID): Promise<void> {
	const account = await accountRepo.readByID(accountID);
	if (!account) {
		throw new Error("Account not found");
	}

	await accountRepo.delete(account);
}

async function followBlog(accountRepo: AccountRepository, accountID: AccountID, blogID: BlogID): Promise<void> {
	const account = await accountRepo.readByID(accountID);
	if (!account) {
		throw new Error("Account not found");
	}

	if (!account.followedBlogs.includes(blogID)) {
		account.followedBlogs.push(blogID);
		await accountRepo.createOrUpdate(account);
	}
}

async function unfollowBlog(accountRepo: AccountRepository, accountID: AccountID, blogID: BlogID): Promise<void> {
	const account = await accountRepo.readByID(accountID);
	if (!account) {
		throw new Error("Account not found");
	}

	account.followedBlogs = account.followedBlogs.filter((id) => id !== blogID);
	await accountRepo.createOrUpdate(account);
}

async function deleteBlog(blogRepo: BlogRepository, blogID: BlogID): Promise<void> {
	const blog = await blogRepo.readByID(blogID);
	if (!blog) {
		throw new Error("Blog not found");
	}

	await blogRepo.delete(blog);
}

async function deletePost(postRepo: PostRepository, postID: PostID): Promise<void> {
	const post = await postRepo.readByID(postID);
	if (!post) {
		throw new Error("Post not found");
	}

	await postRepo.delete(post);
}
