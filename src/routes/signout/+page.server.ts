import { redirect } from "@sveltejs/kit";

import { SESSION_COOKIE_NAME } from "$lib/server/web/cookie";

import type { Actions } from "./$types";

export const actions = {
	default: async ({ cookies, locals }) => {
		// Check for a session token. If there isn't one, just redirect back home.
		const sessionToken = cookies.get(SESSION_COOKIE_NAME);
		if (!sessionToken) {
			redirect(303, "/");
		}

		// Delete the existing session cookie.
		cookies.delete(SESSION_COOKIE_NAME, {
			path: "/",
		});

		// Sign the user out.
		await locals.command.auth.signOut(sessionToken);

		// Redirect back to the index page.
		redirect(303, "/");
	},
} satisfies Actions;
