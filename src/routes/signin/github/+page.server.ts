import { redirect } from "@sveltejs/kit";
import * as arctic from "arctic";

import { OAUTH_STATE_COOKIE_NAME, sessionCookieOptions } from "$lib/server/web/cookies";
import { errorBadRequest } from "$lib/server/web/errors";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, locals }) => {
	const githubOAuth = locals.config.githubOAuth;
	if (!githubOAuth) {
		console.log("GitHub OAuth configuration is missing.");
		errorBadRequest();
	}

	const github = new arctic.GitHub(githubOAuth.clientID, githubOAuth.clientSecret, githubOAuth.redirectURI);

	const state = arctic.generateState();
	cookies.set(OAUTH_STATE_COOKIE_NAME, state, sessionCookieOptions());

	const url = github.createAuthorizationURL(state, []);
	redirect(303, url);
};
