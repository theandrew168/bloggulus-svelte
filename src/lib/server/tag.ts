import type { UUID } from "$lib/types";

export type NewTagParams = {
	name: string;
};

export type LoadTagParams = {
	id: UUID;
	name: string;
	metaCreatedAt: Date;
	metaUpdatedAt: Date;
	metaVersion: number;
};

export class Tag {
	private _id: UUID;
	private _name: string;
	private _metaCreatedAt: Date;
	private _metaUpdatedAt: Date;
	private _metaVersion: number;

	constructor({ name }: NewTagParams) {
		this._id = crypto.randomUUID();
		this._name = name;
		this._metaCreatedAt = new Date();
		this._metaUpdatedAt = new Date();
		this._metaVersion = 1;
	}

	static load({ id, name, metaCreatedAt, metaUpdatedAt, metaVersion }: LoadTagParams): Tag {
		const tag = new Tag({ name });
		tag._id = id;
		tag._name = name;
		tag._metaCreatedAt = metaCreatedAt;
		tag._metaUpdatedAt = metaUpdatedAt;
		tag._metaVersion = metaVersion;
		return tag;
	}

	get id(): UUID {
		return this._id;
	}

	get name(): string {
		return this._name;
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
