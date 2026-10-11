import { redirect } from "@sveltejs/kit";

import { SESSION_EXPIRY_SECONDS } from "#lib/server/command/auth.js";
import { hmac, randomString } from "#lib/server/utils.js";
import { permanentCookieOptions, SESSION_COOKIE_NAME } from "#lib/server/web/cookie.js";
import { errorNotFound } from "#lib/server/web/errors.js";

import type { Actions } from "./$types";

export const actions = {
	default: async ({ cookies, locals }) => {
		const config = locals.config;
		if (!config.enableDebugAuth) {
			errorNotFound();
		}

		// Generate a random userID for the debug sign in.
		const userID = "debug_" + randomString(16);
		const username = hmac(locals.config.secretKey, userID);

		// Sign the user in and generate a session token.
		const sessionToken = await locals.command.auth.signIn(username);

		// Set a permanent cookie after sign in.
		cookies.set(SESSION_COOKIE_NAME, sessionToken, permanentCookieOptions(SESSION_EXPIRY_SECONDS));

		redirect(303, "/");
	},
} satisfies Actions;
