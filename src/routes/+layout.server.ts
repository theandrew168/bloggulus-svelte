import { NOTIFICATION_COOKIE_NAME } from "$lib/server/web/cookies";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const account = locals.account;

	// Check for and clear any existing notifications.
	const notification = cookies.get(NOTIFICATION_COOKIE_NAME);
	cookies.delete(NOTIFICATION_COOKIE_NAME, {
		path: "/",
	});

	return { account, notification };
};
