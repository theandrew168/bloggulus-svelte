import { redirect } from "@sveltejs/kit";

import { signOut } from "$lib/server/command/auth";

import type { Actions } from "./$types";

export const actions = {
	default: async ({ cookies, locals }) => {
		// Check for a session token. If there isn't one, just redirect back home.
		const sessionToken = cookies.get("bloggulus_session");
		if (!sessionToken) {
			redirect(303, "/");
		}

		// Delete the existing session cookie.
		cookies.delete("bloggulus_session", {
			path: "/",
		});

		// Sign the user out.
		await signOut(locals.repo, sessionToken);

		// Redirect back to the index page.
		redirect(303, "/");
	},
} satisfies Actions;
