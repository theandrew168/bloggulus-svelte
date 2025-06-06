import type { AccountRepository } from "$lib/server/domain/repository/account";
import type { BlogRepository } from "$lib/server/domain/repository/blog";
import type { PostRepository } from "$lib/server/domain/repository/post";
import type { Repository } from "$lib/server/domain/repository/repository";
import type { SessionRepository } from "$lib/server/domain/repository/session";
import type { TagRepository } from "$lib/server/domain/repository/tag";

import { MemoryAccountRepository } from "./account";
import { MemoryBlogRepository } from "./blog";
import { MemoryPostRepository } from "./post";
import { MemorySessionRepository } from "./session";
import { MemoryTagRepository } from "./tag";

export class MemoryRepository implements Repository {
	private static _instance?: MemoryRepository;
	readonly account: AccountRepository;
	readonly session: SessionRepository;
	readonly blog: BlogRepository;
	readonly post: PostRepository;
	readonly tag: TagRepository;

	constructor() {
		this.account = new MemoryAccountRepository();
		this.session = new MemorySessionRepository();
		this.blog = new MemoryBlogRepository();
		this.post = new MemoryPostRepository();
		this.tag = new MemoryTagRepository();
	}

	static getInstance(): MemoryRepository {
		if (!this._instance) {
			this._instance = new MemoryRepository();
		}

		return this._instance;
	}

	async asUnitOfWork(operation: (repo: Repository) => Promise<void>): Promise<void> {
		return operation(this);
	}
}
