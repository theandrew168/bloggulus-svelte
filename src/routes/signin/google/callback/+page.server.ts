import { redirect } from "@sveltejs/kit";
import * as arctic from "arctic";

import { SESSION_EXPIRY_SECONDS } from "$lib/server/command/auth";
import { hmac } from "$lib/server/utils";
import {
	OAUTH_CODE_VERIFIER_COOKIE_NAME,
	OAUTH_STATE_COOKIE_NAME,
	permanentCookieOptions,
	SESSION_COOKIE_NAME,
	sessionCookieOptions,
} from "$lib/server/web/cookie";
import { errorBadRequest } from "$lib/server/web/errors";

import type { PageServerLoad } from "./$types";

type GoogleUser = {
	id: string;
};

async function fetchGoogleUserID(accessToken: string): Promise<string> {
	const resp = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const user: GoogleUser = await resp.json();
	return `google_${user.id}`;
}

export const load: PageServerLoad = async ({ cookies, locals, url }) => {
	const googleOAuth = locals.config.googleOAuth;
	if (!googleOAuth) {
		console.log("Google OAuth configuration is missing.");
		errorBadRequest();
	}

	const state = url.searchParams.get("state");
	if (!state) {
		console.log("Missing state parameter in Google OAuth callback.");
		errorBadRequest();
	}

	const storedState = cookies.get(OAUTH_STATE_COOKIE_NAME);
	if (!storedState) {
		console.log("Missing stored state cookie for Google OAuth.");
		errorBadRequest();
	}

	cookies.delete(OAUTH_STATE_COOKIE_NAME, sessionCookieOptions());

	if (state !== storedState) {
		console.log("State parameter does not match stored state cookie.");
		errorBadRequest();
	}

	const codeVerifier = cookies.get(OAUTH_CODE_VERIFIER_COOKIE_NAME);
	if (!codeVerifier) {
		console.log("Missing code verifier cookie for Google OAuth.");
		errorBadRequest();
	}

	cookies.delete(OAUTH_CODE_VERIFIER_COOKIE_NAME, sessionCookieOptions());

	const code = url.searchParams.get("code");
	if (!code) {
		console.log("Missing code parameter in Google OAuth callback.");
		errorBadRequest();
	}

	// Exchange the authorization code for an access token.
	const google = new arctic.Google(googleOAuth.clientID, googleOAuth.clientSecret, googleOAuth.redirectURI);
	const token = await google.validateAuthorizationCode(code, codeVerifier);
	const accessToken = token.accessToken();

	// Fetch the Google user ID using the access token.
	const userID = await fetchGoogleUserID(accessToken);

	// Generate a username based on the userID and sign the user in.
	const username = await hmac(locals.config.secretKey, userID);
	const sessionToken = await locals.command.auth.signIn(username);

	// Set a permanent cookie after sign in.
	cookies.set(SESSION_COOKIE_NAME, sessionToken, permanentCookieOptions(SESSION_EXPIRY_SECONDS));

	redirect(303, "/");
};
