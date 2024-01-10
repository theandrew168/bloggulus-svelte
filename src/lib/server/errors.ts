import { error } from "@sveltejs/kit";

export function errorBadRequest() {
	return error(400, {
		message: "Bad Request",
	});
}

export function errorUnauthorized() {
	return error(401, {
		message: "Unauthorized",
	});
}

export function errorNotFound() {
	return error(404, {
		message: "Not Found",
	});
}
