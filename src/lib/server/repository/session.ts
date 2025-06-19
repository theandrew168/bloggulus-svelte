import type { UUID } from "$lib/types";

import type { Session } from "../session";

export type SessionRepository = {
	create: (session: Session, token: string) => Promise<void>;
	readByID: (id: UUID) => Promise<Session | undefined>;
	readByToken: (token: string) => Promise<Session | undefined>;
	// Used for deleting expired sessions.
	listExpired: (now: Date) => Promise<Session[]>;
	delete: (session: Session) => Promise<void>;
};
