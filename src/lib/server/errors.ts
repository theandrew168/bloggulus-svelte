import { error } from "@sveltejs/kit";

export function errorBadRequest(): never {
	error(400, {
		message: "Bad Request",
	});
}

export function errorUnauthorized(): never {
	error(401, {
		message: "Unauthorized",
	});
}

export function errorNotFound(): never {
	error(404, {
		message: "Not Found",
	});
}
