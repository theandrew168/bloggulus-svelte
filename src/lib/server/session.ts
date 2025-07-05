import type { UUID } from "$lib/types";

import { randomString } from "./utils";

export type NewSessionParams = {
	accountID: UUID;
	expiresAt: Date;
};

export type LoadSessionParams = {
	id: UUID;
	accountID: UUID;
	expiresAt: Date;
	metaCreatedAt: Date;
	metaUpdatedAt: Date;
	metaVersion: number;
};

export class Session {
	private _id: UUID;
	private _accountID: UUID;
	private _expiresAt: Date;
	private _metaCreatedAt: Date;
	private _metaUpdatedAt: Date;
	private _metaVersion: number;

	constructor({ accountID, expiresAt }: NewSessionParams) {
		this._id = crypto.randomUUID();
		this._accountID = accountID;
		this._expiresAt = expiresAt;
		this._metaCreatedAt = new Date();
		this._metaUpdatedAt = new Date();
		this._metaVersion = 1;
	}

	static load({ id, accountID, expiresAt, metaCreatedAt, metaUpdatedAt, metaVersion }: LoadSessionParams): Session {
		const session = new Session({ accountID, expiresAt });
		session._id = id;
		session._accountID = accountID;
		session._expiresAt = expiresAt;
		session._metaCreatedAt = metaCreatedAt;
		session._metaUpdatedAt = metaUpdatedAt;
		session._metaVersion = metaVersion;
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

	get metaCreatedAt(): Date {
		return this._metaCreatedAt;
	}

	get metaUpdatedAt(): Date {
		return this._metaUpdatedAt;
	}

	get metaVersion(): number {
		return this._metaVersion;
	}
}

export function generateSessionToken(): string {
	return randomString(32);
}
