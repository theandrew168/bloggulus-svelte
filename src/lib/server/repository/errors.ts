export class NotFoundError extends Error {
	readonly resource: string;
	readonly key: string;
	readonly value: string;

	constructor(message: string, resource: string, key: string, value: string) {
		super(message);
		this.name = "NotFoundError";
		this.resource = resource;
		this.key = key;
		this.value = value;
	}
}

export class ConcurrentUpdateError extends Error {
	readonly resource: string;
	readonly key: string;
	readonly value: string;

	constructor(message: string, resource: string, key: string, value: string) {
		super(message);
		this.name = "ConcurrentUpdateError";
		this.resource = resource;
		this.key = key;
		this.value = value;
	}
}
