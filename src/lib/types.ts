import type { UUID } from "node:crypto";

export type Account = {
	id: UUID;
	username: string;
};

export type Article = {
	title: string;
	url: string;
	blogTitle: string;
	blogURL: string;
	publishedAt: Date;
	tags: string[];
};

export type BlogDetails = {
	id: UUID;
	feedURL: string;
	siteURL: string;
	title: string;
	syncedAt?: Date;
};

export type PostDetails = {
	id: UUID;
	blogID: UUID;
	url: string;
	title: string;
	publishedAt: Date;
};

export type Blog = {
	id: UUID;
	title: string;
	siteURL: string;
	isFollowed: boolean;
};
