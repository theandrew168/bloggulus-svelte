import type { UUID } from "$lib/types";

import { Meta } from "./meta";

export type NewTagParams = {
	name: string;
};

export type LoadTagParams = {
	id: UUID;
	name: string;
	meta: Meta;
};

export class Tag {
	private _id: UUID;
	private _name: string;
	private _meta: Meta;

	constructor({ name }: NewTagParams) {
		this._id = crypto.randomUUID();
		this._name = name;
		this._meta = new Meta();
	}

	static load({ id, name, meta }: LoadTagParams): Tag {
		const tag = new Tag({ name });
		tag._id = id;
		tag._name = name;
		tag._meta = meta;
		return tag;
	}

	get id(): UUID {
		return this._id;
	}

	get name(): string {
		return this._name;
	}

	get meta(): Meta {
		return this._meta;
	}
}
