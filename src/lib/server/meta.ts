export type LoadMetaParams = {
	createdAt: Date;
	updatedAt: Date;
	version: number;
};

export class Meta {
	private _createdAt: Date;
	private _updatedAt: Date;
	private _version: number;

	constructor() {
		this._createdAt = new Date();
		this._updatedAt = new Date();
		this._version = 1;
	}

	static load({ createdAt, updatedAt, version }: LoadMetaParams): Meta {
		const meta = new Meta();
		meta._createdAt = createdAt;
		meta._updatedAt = updatedAt;
		meta._version = version;
		return meta;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	set updatedAt(value: Date) {
		this._updatedAt = value;
	}

	get version(): number {
		return this._version;
	}

	set version(value: number) {
		this._version = value;
	}
}
