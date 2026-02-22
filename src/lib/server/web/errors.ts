import { error } from "@sveltejs/kit";

export function errorBadRequest(message: string = "Bad Request"): never {
	error(400, { message });
}

export function errorUnauthorized(message: string = "Unauthorized"): never {
	error(401, { message });
}

export function errorNotFound(message: string = "Not Found"): never {
	error(404, { message });
}
