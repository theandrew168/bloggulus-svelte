import { redirect } from "@sveltejs/kit";

import { sessionCookieOptions } from "$lib/server/utils";
import { NOTIFICATION_COOKIE_NAME } from "$lib/server/web/cookies";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, locals }) => {
	cookies.set(NOTIFICATION_COOKIE_NAME, "Notifications are awesome!", sessionCookieOptions());
	redirect(303, "/");
};
