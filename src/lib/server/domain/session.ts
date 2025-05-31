import { randomBytes, randomUUID, type UUID } from "node:crypto";

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

export class Session {
	private _id: UUID;
	private _accountID: UUID;
	private _token: string;
	private _expiresAt: Date;

	constructor({ accountID, expiresAt }: NewSessionParams) {
		this._id = randomUUID();
		this._accountID = accountID;
		this._token = randomBytes(32).toString("base64url"); // Ensure token is unique and secure
		this._expiresAt = expiresAt;
	}

	get id(): UUID {
		return this._id;
	}

	get accountID(): UUID {
		return this._accountID;
	}

	get token(): string {
		return this._token;
	}

	get expiresAt(): Date {
		return this._expiresAt;
	}
}
