import type { UUID } from "node:crypto";

import type { Blog } from "$lib/server/domain/blog";
import type { BlogRepository } from "$lib/server/domain/repository";

export class MemoryBlogRepository implements BlogRepository {
	private static _instance?: MemoryBlogRepository;
	private _db: Map<UUID, Blog>;

	constructor() {
		this._db = new Map();
	}

	static getInstance(): MemoryBlogRepository {
		if (!this._instance) {
			this._instance = new MemoryBlogRepository();
		}

		return this._instance;
	}

	async list(): Promise<Blog[]> {
		return Array.from(this._db.values());
	}

	async readByID(id: UUID): Promise<Blog | undefined> {
		return this._db.get(id);
	}

	async readByFeedURL(feedURL: URL): Promise<Blog | undefined> {
		return this._db.values().find((blog) => blog.feedURL.toString() === feedURL.toString());
	}

	async createOrUpdate(blog: Blog): Promise<void> {
		this._db.set(blog.id, blog);
	}

	async delete(blog: Blog): Promise<void> {
		this._db.delete(blog.id);
	}
}
