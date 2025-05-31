import type { UUID } from "node:crypto";

import type { SessionRepository } from "$lib/server/domain/repository";
import type { Session } from "$lib/server/domain/session";

export class MemorySessionRepository implements SessionRepository {
	private static _instance?: MemorySessionRepository;
	private _db: Map<UUID, Session>;

	constructor() {
		this._db = new Map();
	}

	static getInstance(): MemorySessionRepository {
		if (!this._instance) {
			console.log("Creating a new instance of MemorySessionRepository");
			this._instance = new MemorySessionRepository();
		}

		return this._instance;
	}

	async listExpired(now: Date): Promise<Session[]> {
		return Array.from(this._db.values().filter((session) => session.expiresAt < now));
	}

	async readByID(id: UUID): Promise<Session | undefined> {
		return this._db.get(id);
	}

	async readByToken(token: string): Promise<Session | undefined> {
		return this._db.values().find((session) => session.token === token);
	}

	async createOrUpdate(session: Session): Promise<void> {
		this._db.set(session.id, session);
	}

	async delete(session: Session): Promise<void> {
		this._db.delete(session.id);
	}
}
