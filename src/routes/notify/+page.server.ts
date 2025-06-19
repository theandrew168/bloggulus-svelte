import { redirect } from "@sveltejs/kit";

import { sessionCookieOptions } from "$lib/server/utils";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, locals }) => {
	cookies.set("bloggulus_notification", "Notifications are awesome!", sessionCookieOptions());
	redirect(303, "/");
};
