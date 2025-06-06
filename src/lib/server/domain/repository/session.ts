import type { UUID } from "node:crypto";

import type { Session } from "../session";

export type SessionRepository = {
	// Used for deleting expired sessions (should this be a query?). We need id.
	// listExpired: (now: Date) => Promise<Session[]>;
	readByID: (id: UUID) => Promise<Session | undefined>;
	readByToken: (token: string) => Promise<Session | undefined>;
	createOrUpdate: (session: Session, token: string) => Promise<void>;
	delete: (session: Session) => Promise<void>;
};
