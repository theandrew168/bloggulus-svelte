import type { AccountRepository } from "./account";
import type { BlogRepository } from "./blog";
import type { PostRepository } from "./post";
import type { SessionRepository } from "./session";
import type { TagRepository } from "./tag";

export type Repository = {
	readonly account: AccountRepository;
	readonly session: SessionRepository;
	readonly blog: BlogRepository;
	readonly post: PostRepository;
	readonly tag: TagRepository;

	asUnitOfWork: (operation: (repo: Repository) => Promise<void>) => Promise<void>;
};
