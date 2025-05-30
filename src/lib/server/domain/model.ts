import { randomUUID, type UUID } from "node:crypto";

// TODO: These should be classes with proper "modification enforcement".
// Known by some as the "uniform access principle" or "encapsulation".

export type BlogID = UUID;
export type Blog = {
	id: BlogID;
	title: string;
	feedURL: URL;
	siteURL: URL;
};

export type PostID = UUID;
export type Post = {
	id: PostID;
	blogID: BlogID;
	url: URL;
	title: string;
	content: string;
	publishedAt: Date;
};

export type TagID = UUID;
export type Tag = {
	id: TagID;
	name: string;
};

export type AccountID = UUID;
export type Account = {
	id: AccountID;
	username: string;
	isAdmin: boolean;
	followedBlogs: BlogID[];
};

export type SessionID = UUID;
export type Session = {
	id: SessionID;
	accountID: AccountID;
	expiresAt: Date;
};
