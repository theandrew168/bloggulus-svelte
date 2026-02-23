import type { UUID } from "$lib/types";

import { Meta } from "./meta";
import { randomString } from "./utils";

export function generateSessionToken(): string {
	return randomString(32);
}

export type NewSessionParams = {
	accountID: UUID;
	expiresAt: Date;
	tokenHash: string;
};

export type LoadSessionParams = {
	id: UUID;
	accountID: UUID;
	expiresAt: Date;
	tokenHash: string;
	meta: Meta;
};

export class Session {
	private _id: UUID;
	private _accountID: UUID;
	private _tokenHash: string;
	private _expiresAt: Date;
	private _meta: Meta;

	constructor({ accountID, expiresAt, tokenHash }: NewSessionParams) {
		this._id = crypto.randomUUID();
		this._accountID = accountID;
		this._tokenHash = tokenHash;
		this._expiresAt = expiresAt;
		this._meta = new Meta();
	}

	static load({ id, accountID, expiresAt, tokenHash, meta }: LoadSessionParams): Session {
		const session = new Session({ accountID, expiresAt, tokenHash });
		session._id = id;
		session._accountID = accountID;
		session._tokenHash = tokenHash;
		session._expiresAt = expiresAt;
		session._meta = meta;
		return session;
	}

	get id(): UUID {
		return this._id;
	}

	get accountID(): UUID {
		return this._accountID;
	}

	get tokenHash(): string {
		return this._tokenHash;
	}

	get expiresAt(): Date {
		return this._expiresAt;
	}

	get meta(): Meta {
		return this._meta;
	}
}
