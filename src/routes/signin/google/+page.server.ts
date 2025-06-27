import { redirect } from "@sveltejs/kit";
import * as arctic from "arctic";

import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	sessionCookieOptions,
} from "$lib/server/web/cookies";
import { errorBadRequest } from "$lib/server/web/errors";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const googleOAuth = locals.config.googleOAuth;
	if (!googleOAuth) {
		console.log("Google OAuth configuration is missing.");
		errorBadRequest();
	}

	const google = new arctic.Google(googleOAuth.clientID, googleOAuth.clientSecret, googleOAuth.redirectURI);

	const state = arctic.generateState();
	cookies.set(OAUTH_STATE_COOKIE_NAME, state, sessionCookieOptions());

	const codeVerifier = arctic.generateCodeVerifier();
	cookies.set(OAUTH_CODE_VERIFIER_COOKIE_NAME, codeVerifier, sessionCookieOptions());

	const url = google.createAuthorizationURL(state, codeVerifier, ["https://www.googleapis.com/auth/userinfo.profile"]);
	redirect(303, url);
};
