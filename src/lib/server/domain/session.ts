import { randomBytes, randomUUID, type UUID } from "node:crypto";

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
