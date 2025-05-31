import { randomUUID, type UUID } from "node:crypto";

export type NewTagParams = {
	name: string;
};

export class Tag {
	private _id: UUID;
	private _name: string;

	constructor({ name }: NewTagParams) {
		this._id = randomUUID();
		this._name = name;
	}

	get id(): UUID {
		return this._id;
	}

	get name(): string {
		return this._name;
	}
}
