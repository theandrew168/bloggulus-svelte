import { redirect } from "@sveltejs/kit";
import { NOTIFICATION_COOKIE_NAME, sessionCookieOptions } from "#lib/server/web/cookie.js";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
	cookies.set(NOTIFICATION_COOKIE_NAME, "Notifications are awesome!", sessionCookieOptions());
	redirect(303, "/");
};
