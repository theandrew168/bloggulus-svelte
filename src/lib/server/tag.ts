import type { UUID } from "$lib/types";

export type NewTagParams = {
	name: string;
};

export type LoadTagParams = {
	id: UUID;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	updateVersion: number;
};

export class Tag {
	private _id: UUID;
	private _name: string;
	private _createdAt: Date;
	private _updatedAt: Date;
	private _updateVersion: number;

	constructor({ name }: NewTagParams) {
		this._id = crypto.randomUUID();
		this._name = name;
		this._createdAt = new Date();
		this._updatedAt = new Date();
		this._updateVersion = 1;
	}

	static load({ id, name, createdAt, updatedAt, updateVersion }: LoadTagParams): Tag {
		const tag = new Tag({ name });
		tag._id = id;
		tag._name = name;
		tag._createdAt = createdAt;
		tag._updatedAt = updatedAt;
		tag._updateVersion = updateVersion;
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

	get updateVersion(): number {
		return this._updateVersion;
	}
}
