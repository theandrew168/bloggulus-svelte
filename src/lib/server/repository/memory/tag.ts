import type { UUID } from "node:crypto";

import type { TagRepository } from "$lib/server/repository/tag";
import type { Tag } from "$lib/server/tag";

export class MemoryTagRepository implements TagRepository {
	private static _instance?: MemoryTagRepository;
	private _db: Map<UUID, Tag>;

	constructor() {
		this._db = new Map();
	}

	static getInstance(): MemoryTagRepository {
		if (!this._instance) {
			this._instance = new MemoryTagRepository();
		}

		return this._instance;
	}

	async readByID(id: UUID): Promise<Tag | undefined> {
		return this._db.get(id);
	}

	async createOrUpdate(tag: Tag): Promise<void> {
		this._db.set(tag.id, tag);
	}

	async delete(tag: Tag): Promise<void> {
		this._db.delete(tag.id);
	}
}
