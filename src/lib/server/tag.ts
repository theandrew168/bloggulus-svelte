import type { UUID } from "$lib/types";

export type NewTagParams = {
	name: string;
};

export type LoadTagParams = {
	id: UUID;
	name: string;
	createdAt: Date;
	updatedAt: Date;
};

export class Tag {
	private _id: UUID;
	private _name: string;
	private _createdAt: Date;
	private _updatedAt: Date;

	constructor({ name }: NewTagParams) {
		this._id = crypto.randomUUID();
		this._name = name;
		this._createdAt = new Date();
		this._updatedAt = new Date();
	}

	static load({ id, name, createdAt, updatedAt }: LoadTagParams): Tag {
		const tag = new Tag({ name });
		tag._id = id;
		tag._name = name;
		tag._createdAt = createdAt;
		tag._updatedAt = updatedAt;
		return tag;
	}

	get id(): UUID {
		return this._id;
	}

	get name(): string {
		return this._name;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}
}
