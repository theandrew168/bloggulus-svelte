import { randomUUID, type UUID } from "node:crypto";

import { randomString } from "./utils";

// TODO: Should session actually be nested under the account aggregate?
// The fact that I want a "readAccountBySessionToken" method suggests that it should be.
// Furthermore, sessions without accounts don't make sense. What about deleting expired
// sessions? That shouldn't be any more complex that necessary. Otherwise, the auth
// middleware will be required to perform TWO queries: one to get the session and
// another to get the account.

export type NewSessionParams = {
	accountID: UUID;
	expiresAt: Date;
};

export type LoadSessionParams = {
	id: UUID;
	accountID: UUID;
	expiresAt: Date;
};

export class Session {
	private _id: UUID;
	private _accountID: UUID;
	private _expiresAt: Date;

	constructor({ accountID, expiresAt }: NewSessionParams) {
		this._id = randomUUID();
		this._accountID = accountID;
		this._expiresAt = expiresAt;
	}

	static load({ id, accountID, expiresAt }: LoadSessionParams): Session {
		const session = new Session({
			accountID,
			expiresAt,
		});
		session._id = id;
		session._accountID = accountID;
		session._expiresAt = expiresAt;
		return session;
	}

	get id(): UUID {
		return this._id;
	}

	get accountID(): UUID {
		return this._accountID;
	}

	get expiresAt(): Date {
		return this._expiresAt;
	}
}

export function generateToken(): string {
	return randomString(32);
}
