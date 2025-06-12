import type { RequestHandler } from "./$types";

export const GET: RequestHandler = () => {
	return new Response("pong\n", {
		headers: {
			"Content-Type": "text/plain",
		},
	});
};
