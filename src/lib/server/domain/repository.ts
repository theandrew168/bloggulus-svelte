import type { UUID } from "node:crypto";

import type { Account } from "./account";
import type { Blog } from "./blog";
import type { Post } from "./post";
import type { Session } from "./session";
import type { Tag } from "./tag";

export type BlogRepository = {
	// Used for syncing blogs.
	list: () => Promise<Blog[]>;
	readByID: (id: UUID) => Promise<Blog | undefined>;
	readByFeedURL: (feedURL: URL) => Promise<Blog | undefined>;
	createOrUpdate: (blog: Blog) => Promise<void>;
	delete: (blog: Blog) => Promise<void>;
};

export type PostRepository = {
	// Used for syncing a blog's posts.
	listByBlogID: (blogID: UUID) => Promise<Post[]>;
	readByID: (id: UUID) => Promise<Post | undefined>;
	createOrUpdate: (post: Post) => Promise<void>;
	delete: (post: Post) => Promise<void>;
};

export type AccountRepository = {
	readByID: (id: UUID) => Promise<Account | undefined>;
	readByUsername: (username: string) => Promise<Account | undefined>;
	readBySessionToken: (sessionToken: string) => Promise<Account | undefined>;
	createOrUpdate: (account: Account) => Promise<void>;
	delete: (account: Account) => Promise<void>;
};

export type SessionRepository = {
	// Used for deleting expired sessions.
	listExpired: (now: Date) => Promise<Session[]>;
	readByID: (id: UUID) => Promise<Session | undefined>;
	createOrUpdate: (session: Session) => Promise<void>;
	delete: (session: Session) => Promise<void>;
};

export type TagRepository = {
	readByID: (id: UUID) => Promise<Tag | undefined>;
	createOrUpdate: (tag: Tag) => Promise<void>;
	delete: (tag: Tag) => Promise<void>;
};
