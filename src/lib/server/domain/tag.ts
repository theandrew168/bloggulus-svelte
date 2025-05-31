import { randomUUID, type UUID } from "node:crypto";

export type NewTagParams = {
	name: string;
};

export type LoadTagParams = {
	id: UUID;
	name: string;
};

export class Tag {
	private _id: UUID;
	private _name: string;

	constructor({ name }: NewTagParams) {
		this._id = randomUUID();
		this._name = name;
	}

	static load({ id, name }: LoadTagParams): Tag {
		const tag = new Tag({ name });
		tag._id = id;
		return tag;
	}

	get id(): UUID {
		return this._id;
	}

	get name(): string {
		return this._name;
	}
}
