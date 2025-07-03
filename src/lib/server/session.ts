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
	createdAt: Date;
	updatedAt: Date;
	updateVersion: number;
};

export class Session {
	private _id: UUID;
	private _accountID: UUID;
	private _expiresAt: Date;
	private _createdAt: Date;
	private _updatedAt: Date;
	private _updateVersion: number;

	constructor({ accountID, expiresAt }: NewSessionParams) {
		this._id = crypto.randomUUID();
		this._accountID = accountID;
		this._expiresAt = expiresAt;
		this._createdAt = new Date();
		this._updatedAt = new Date();
		this._updateVersion = 1;
	}

	static load({ id, accountID, expiresAt, createdAt, updatedAt, updateVersion }: LoadSessionParams): Session {
		const session = new Session({ accountID, expiresAt });
		session._id = id;
		session._accountID = accountID;
		session._expiresAt = expiresAt;
		session._createdAt = createdAt;
		session._updatedAt = updatedAt;
		session._updateVersion = updateVersion;
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

	get updateVersion(): number {
		return this._updateVersion;
	}
}

export function generateSessionToken(): string {
	return randomString(32);
}
