import { redirect } from "@sveltejs/kit";

import { SESSION_EXPIRY_SECONDS } from "$lib/server/command/auth";
import { hmac, permanentCookieOptions, randomString } from "$lib/server/utils";
import { errorNotFound } from "$lib/server/web/errors";

import type { Actions } from "./$types";

export const actions = {
	default: async ({ cookies, locals }) => {
		const config = locals.config;
		if (!config.enableDebugAuth) {
			errorNotFound();
		}

		// Generate a random userID for the debug sign in.
		const userID = "debug_" + randomString(16);
		// TODO: Get this from config / env.
		const secretKey = randomString(32);
		const username = hmac(secretKey, userID);

		// Sign the user in and generate a session token.
		const sessionToken = await locals.command.auth.signIn(username);

		// Set a permanent cookie after sign in.
		cookies.set("bloggulus_session", sessionToken, permanentCookieOptions(SESSION_EXPIRY_SECONDS));

		// Check if there is a "next" cookie to redirect to.
		let next = "/";
		const nextCookie = cookies.get("next");
		if (nextCookie) {
			next = nextCookie;
			cookies.delete("next", { path: "/" });
		}

		redirect(302, next);
	},
} satisfies Actions;
