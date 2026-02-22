import type { UUID } from "$lib/types";

import { Meta } from "./meta";
import { randomString } from "./utils";

export function generateSessionToken(): string {
	return randomString(32);
}

export type NewSessionParams = {
	accountID: UUID;
	expiresAt: Date;
};

export type LoadSessionParams = {
	id: UUID;
	accountID: UUID;
	expiresAt: Date;
	meta: Meta;
};

export class Session {
	private _id: UUID;
	private _accountID: UUID;
	private _expiresAt: Date;
	private _meta: Meta;

	constructor({ accountID, expiresAt }: NewSessionParams) {
		this._id = crypto.randomUUID();
		this._accountID = accountID;
		this._expiresAt = expiresAt;
		this._meta = new Meta();
	}

	static load({ id, accountID, expiresAt, meta }: LoadSessionParams): Session {
		const session = new Session({ accountID, expiresAt });
		session._id = id;
		session._accountID = accountID;
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

	get expiresAt(): Date {
		return this._expiresAt;
	}

	get meta(): Meta {
		return this._meta;
	}
}
