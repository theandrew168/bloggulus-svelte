import type { AccountRepository } from "./account";
import type { BlogRepository } from "./blog";
import type { PostRepository } from "./post";
import type { SessionRepository } from "./session";
import type { TagRepository } from "./tag";

// TODO: createOrUpdate should probably be split so that update can add "where updated_at"
// and then ensure one row was updated (to detect race conditions).

export type Repository = {
	readonly account: AccountRepository;
	readonly session: SessionRepository;
	readonly blog: BlogRepository;
	readonly post: PostRepository;
	readonly tag: TagRepository;

	asUnitOfWork: (operation: (repo: Repository) => Promise<void>) => Promise<void>;
};
