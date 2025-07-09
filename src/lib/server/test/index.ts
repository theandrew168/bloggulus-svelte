import Chance from "chance";
import xml2js from "xml2js";

import { Account, type NewAccountParams } from "$lib/server/account";
import { Blog, type NewBlogParams } from "$lib/server/blog";
import type { FeedBlog, FeedPost } from "$lib/server/feed/parse";
import type { NewPostParams } from "$lib/server/post";
import type { NewSessionParams } from "$lib/server/session";
import type { NewTagParams } from "$lib/server/tag";

const chance = new Chance();

/**
 * Generate random (but realistic) params for creating a new Blog.
 */
export function randomBlogParams(): NewBlogParams {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);

	const params: NewBlogParams = {
		feedURL: new URL(chance.url()),
		siteURL: new URL(chance.url()),
		title: chance.sentence({ words: 3 }),
		syncedAt: yesterday,
	};
	return params;
}

/**
 * Generate random (but realistic) params for creating a new Post.
 */
export function randomPostParams(blog: Blog): NewPostParams {
	const params: NewPostParams = {
		blogID: blog.id,
		url: new URL(chance.url()),
		title: chance.sentence({ words: 3 }),
		publishedAt: new Date(),
		content: chance.paragraph(),
	};
	return params;
}

/**
 * Generate random (but realistic) params for creating a new Tag.
 */
export function randomTagParams(): NewTagParams {
	const params: NewTagParams = {
		name: chance.word({ length: 20 }),
	};
	return params;
}

/**
 * Generate random (but realistic) params for creating a new Account.
 */
export function randomAccountParams(): NewAccountParams {
	const params: NewAccountParams = {
		username: chance.word({ length: 20 }),
	};
	return params;
}

/**
 * Generate random (but realistic) params for creating a new Session.
 */
export function randomSessionParams(account: Account): NewSessionParams {
	const params: NewSessionParams = {
		accountID: account.id,
		expiresAt: new Date(),
	};
	return params;
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
