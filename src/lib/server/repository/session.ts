import type { UUID } from "node:crypto";

import type { Session } from "../session";

export type SessionRepository = {
	createOrUpdate: (session: Session, token: string) => Promise<void>;
	readByID: (id: UUID) => Promise<Session | undefined>;
	readByToken: (token: string) => Promise<Session | undefined>;
	// Used for deleting expired sessions.
	listExpired: (now: Date) => Promise<Session[]>;
	delete: (session: Session) => Promise<void>;
};
