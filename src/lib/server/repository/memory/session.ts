import type { UUID } from "node:crypto";

import type { SessionRepository } from "$lib/server/domain/repository/session";
import type { Session } from "$lib/server/domain/session";

export class MemorySessionRepository implements SessionRepository {
	private static _instance?: MemorySessionRepository;
	private _db: Map<UUID, Session>;
	private _tokenToID: Map<string, UUID>;

	constructor() {
		this._db = new Map();
		this._tokenToID = new Map();
	}

	static getInstance(): MemorySessionRepository {
		if (!this._instance) {
			this._instance = new MemorySessionRepository();
		}

		return this._instance;
	}

	async readByID(id: UUID): Promise<Session | undefined> {
		return this._db.get(id);
	}

	async readByToken(token: string): Promise<Session | undefined> {
		const id = this._tokenToID.get(token);
		if (!id) {
			return undefined;
		}

		return this.readByID(id);
	}

	async createOrUpdate(session: Session, token: string): Promise<void> {
		this._db.set(session.id, session);
		this._tokenToID.set(token, session.id);
	}

	async delete(session: Session): Promise<void> {
		this._db.delete(session.id);
		for (const [token, id] of this._tokenToID.entries()) {
			if (id === session.id) {
				this._tokenToID.delete(token);
			}
		}
	}
}
