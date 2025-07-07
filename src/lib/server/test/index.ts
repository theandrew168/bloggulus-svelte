import Chance from "chance";
import xml2js from "xml2js";

import { Account } from "$lib/server/account";
import { Blog } from "$lib/server/blog";
import type { FeedBlog, FeedPost } from "$lib/server/feed/parse";
import { Post } from "$lib/server/post";
import type { Repository } from "$lib/server/repository";
import { generateSessionToken, Session } from "$lib/server/session";

const chance = new Chance();

/**
 * Generates a new blog instance with random data.
 */
export function newBlog(): Blog {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);

	const blog = new Blog({
		feedURL: new URL(chance.url()),
		siteURL: new URL(chance.url()),
		title: chance.sentence({ words: 3 }),
		syncedAt: yesterday,
	});
	return blog;
}

/**
 * Generates a new blog and saves it to the repository.
 */
export async function createNewBlog(repo: Repository): Promise<Blog> {
	const blog = newBlog();
	await repo.blog.create(blog);
	return blog;
}

/**
 * Generates a new post instance for the given blog with random data.
 */
export function newPost(blog: Blog): Post {
	const post = new Post({
		blogID: blog.id,
		url: new URL(chance.url()),
		title: chance.sentence({ words: 3 }),
		publishedAt: new Date(),
		content: chance.paragraph(),
	});
	return post;
}

/**
 * Generates a new post for the given blog and saves it to the repository.
 */
export async function createNewPost(repo: Repository, blog: Blog): Promise<Post> {
	const post = newPost(blog);
	await repo.post.create(post);
	return post;
}

/**
 * Generates a new account instance with random data.
 */
export function newAccount(): Account {
	const account = new Account({
		username: chance.word({ length: 20 }),
	});
	return account;
}

/**
 * Generates a new account and saves it to the repository.
 */
export async function createNewAccount(repo: Repository): Promise<Account> {
	const account = newAccount();
	await repo.account.create(account);
	return account;
}

/**
 * Generates a new session instance for the given account.
 */
export function newSession(account: Account, expiresAt: Date = new Date()): Session {
	const session = new Session({
		accountID: account.id,
		expiresAt,
	});
	return session;
}

/**
 * Generates a new session for the given account and saves it to the repository.
 */
export async function createNewSession(
	repo: Repository,
	account: Account,
	expiresAt: Date = new Date(),
): Promise<Session> {
	const session = newSession(account, expiresAt);
	await repo.session.create(session, generateSessionToken());
	return session;
}

export type PartialFeedPost = Partial<FeedPost>;
export type PartialFeedBlog = Omit<Partial<FeedBlog>, "posts"> & {
	posts: PartialFeedPost[];
};

/**
 * Generates an Atom feed XML string from a PartialFeedBlog object.
 */
export function generateAtomFeed(blog: PartialFeedBlog): string {
	const builder = new xml2js.Builder();
	const xml = builder.buildObject({
		feed: {
			title: blog.title,
			link: [
				{ $: { rel: "self", href: blog.feedURL?.toString() } },
				{ $: { rel: "alternate", href: blog.siteURL?.toString() } },
			],
			entry: blog.posts.map((post) => ({
				...(post.url ? { link: { $: { href: post.url?.toString() } } } : {}),
				title: post.title,
				content: post.content,
				published: post.publishedAt?.toISOString(),
			})),
		},
	});
	return xml;
}

/**
 * Generates an RSS feed XML string from a PartialFeedBlog object.
 */
export function generateRSSFeed(blog: PartialFeedBlog): string {
	const builder = new xml2js.Builder();
	const xml = builder.buildObject({
		rss: {
			$: { version: "2.0" },
			channel: {
				title: blog.title,
				link: blog.siteURL?.toString(),
				item: blog.posts.map((post) => ({
					title: post.title,
					link: post.url?.toString(),
					pubDate: post.publishedAt?.toUTCString(),
					description: post.content,
				})),
			},
		},
	});
	return xml;
}
