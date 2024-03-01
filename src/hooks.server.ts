import type { Handle } from "@sveltejs/kit";

import { connect } from "$lib/server/storage/storage";

export const handle: Handle = async ({ event, resolve }) => {
	// enforce authorization on any /admin route
	if (event.url.pathname.startsWith("/admin")) {
		const auth = event.request.headers.get("Authorization");
		const secret = process.env.ADMIN_SECRET;
		if (!secret || auth !== `Basic ${btoa(secret)}`) {
			return new Response("Unauthorized", {
				status: 401,
				headers: {
					"WWW-Authenticate": 'Basic realm="User Visible Realm", charset="UTF-8"',
				},
			});
		}
	}

	event.locals.storage = connect();
	return resolve(event);
};
