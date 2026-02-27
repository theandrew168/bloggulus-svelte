import { DatabaseError } from "pg";

export class UniqueViolationError extends Error {
	static code = "23505";

	readonly schema: string;
	readonly table: string;
	readonly constraint: string;

	constructor(message: string, schema: string, table: string, constraint: string) {
		super(message);
		this.name = "UniqueViolationError";
		this.schema = schema;
		this.table = table;
		this.constraint = constraint;
	}
}

export function parseDatabaseError(err: DatabaseError): Error {
	const { message, code, schema, table, constraint } = err;
	if (!code) {
		return err;
	}

	switch (code) {
		case UniqueViolationError.code:
			return new UniqueViolationError(message, schema!, table!, constraint!);
		default:
			return err;
	}
}
