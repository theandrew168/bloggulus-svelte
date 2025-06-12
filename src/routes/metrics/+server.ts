import * as client from "prom-client";

import type { RequestHandler } from "./$types";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const GET: RequestHandler = async () => {
	const metrics = await register.metrics();
	return new Response(metrics, {
		headers: {
			"Content-Type": register.contentType,
		},
	});
};
