export class InternalError extends Error {
	externalize(): ExternalError {
		return new ExternalError("Internal Server Error", { cause: this, statusCode: 500 });
	}
}

export type ExternalErrorOptions = ErrorOptions & {
	statusCode: number;
};

export class ExternalError extends Error {
	readonly statusCode: number;

	constructor(message: string, options: ExternalErrorOptions) {
		super(message, { cause: options.cause });
		this.statusCode = options.statusCode;
	}
}
