import type { UUID } from "node:crypto";

import type { Post } from "$lib/server/domain/post";
import type { PostRepository } from "$lib/server/domain/repository/post";

export class MemoryPostRepository implements PostRepository {
	private static _instance?: MemoryPostRepository;
	private _db: Map<UUID, Post>;

	constructor() {
		this._db = new Map();
	}

	static getInstance(): MemoryPostRepository {
		if (!this._instance) {
			this._instance = new MemoryPostRepository();
		}

		return this._instance;
	}

	async readByID(id: UUID): Promise<Post | undefined> {
		return this._db.get(id);
	}

	async createOrUpdate(post: Post): Promise<void> {
		this._db.set(post.id, post);
	}

	async delete(post: Post): Promise<void> {
		this._db.delete(post.id);
	}
}
