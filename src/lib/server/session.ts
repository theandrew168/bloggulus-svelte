import type { UUID } from "$lib/types";

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
	createdAt: Date;
	updatedAt: Date;
};

export class Session {
	private _id: UUID;
	private _accountID: UUID;
	private _expiresAt: Date;
	private _createdAt: Date;
	private _updatedAt: Date;

	constructor({ accountID, expiresAt }: NewSessionParams) {
		this._id = crypto.randomUUID();
		this._accountID = accountID;
		this._expiresAt = expiresAt;
		this._createdAt = new Date();
		this._updatedAt = new Date();
	}

	static load({ id, accountID, expiresAt, createdAt, updatedAt }: LoadSessionParams): Session {
		const session = new Session({ accountID, expiresAt });
		session._id = id;
		session._accountID = accountID;
		session._expiresAt = expiresAt;
		session._createdAt = createdAt;
		session._updatedAt = updatedAt;
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

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}
}

export function generateSessionToken(): string {
	return randomString(32);
}
