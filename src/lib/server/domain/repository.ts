import type { Account, AccountID, Blog, BlogID, Post, PostID, Session, SessionID, Tag, TagID } from "./model";

export type BlogRepository = {
	// Used for syncing blogs.
	list: () => Promise<Blog[]>;
	readByID: (id: BlogID) => Promise<Blog | undefined>;
	readByFeedURL: (feedURL: URL) => Promise<Blog | undefined>;
	createOrUpdate: (blog: Blog) => Promise<void>;
	delete: (blog: Blog) => Promise<void>;
};

export type PostRepository = {
	// Used for syncing a blog's posts.
	listByBlogID: (blogID: BlogID) => Promise<Post[]>;
	readByID: (id: PostID) => Promise<Post | undefined>;
	createOrUpdate: (post: Post) => Promise<void>;
	delete: (post: Post) => Promise<void>;
};

export type AccountRepository = {
	readByID: (id: AccountID) => Promise<Account | undefined>;
	readByUsername: (username: string) => Promise<Account | undefined>;
	readBySessionID: (sessionID: SessionID) => Promise<Account | undefined>;
	createOrUpdate: (account: Account) => Promise<void>;
	delete: (account: Account) => Promise<void>;
};

export type SessionRepository = {
	// Used for deleting expired sessions.
	listExpired: (now: Date) => Promise<Session[]>;
	readByID: (id: SessionID) => Promise<Session | undefined>;
	createOrUpdate: (session: Session) => Promise<void>;
	delete: (session: Session) => Promise<void>;
};

export type TagRepository = {
	readByID: (id: TagID) => Promise<Tag | undefined>;
	createOrUpdate: (tag: Tag) => Promise<void>;
	delete: (tag: Tag) => Promise<void>;
};
