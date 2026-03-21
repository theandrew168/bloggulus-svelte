import { redirect } from "@sveltejs/kit";
import * as arctic from "arctic";
import { request } from "undici";

import { SESSION_EXPIRY_SECONDS } from "$lib/server/command/auth";
import { hmac, USER_AGENT } from "$lib/server/utils";
import {
	OAUTH_STATE_COOKIE_NAME,
	permanentCookieOptions,
	SESSION_COOKIE_NAME,
	sessionCookieOptions,
} from "$lib/server/web/cookie";
import { errorBadRequest } from "$lib/server/web/errors";

import type { PageServerLoad } from "./$types";

type GithubUser = {
	id: string;
};

async function fetchGithubUserID(accessToken: string): Promise<string> {
	const { body, statusCode, statusText } = await request("https://api.github.com/user", {
		headers: {
			"user-agent": USER_AGENT,
			authorization: `Bearer ${accessToken}`,
		},
	});

	if (statusCode < 200 || statusCode >= 300) {
		console.log(`Failed to fetch GitHub user info: ${statusCode} ${statusText}`);
		console.log(await body.text());
		errorBadRequest();
	}

	const user = (await body.json()) as GithubUser;
	return `github_${user.id}`;
}

export const load: PageServerLoad = async ({ cookies, locals, url }) => {
	const githubOAuth = locals.config.githubOAuth;
	if (!githubOAuth) {
		console.log("GitHub OAuth configuration is missing.");
		errorBadRequest();
	}

	const state = url.searchParams.get("state");
	if (!state) {
		console.log("Missing state parameter in GitHub OAuth callback.");
		errorBadRequest();
	}

	const storedState = cookies.get(OAUTH_STATE_COOKIE_NAME);
	if (!storedState) {
		console.log("Missing stored state cookie for GitHub OAuth.");
		errorBadRequest();
	}

	cookies.delete(OAUTH_STATE_COOKIE_NAME, sessionCookieOptions());

	if (state !== storedState) {
		console.log("State parameter does not match stored state cookie.");
		errorBadRequest();
	}

	const code = url.searchParams.get("code");
	if (!code) {
		console.log("Missing code parameter in GitHub OAuth callback.");
		errorBadRequest();
	}

	// Exchange the authorization code for an access token.
	const github = new arctic.GitHub(githubOAuth.clientID, githubOAuth.clientSecret, githubOAuth.redirectURI);
	const token = await github.validateAuthorizationCode(code);
	const accessToken = token.accessToken();

	// Fetch the GitHub user ID using the access token.
	const userID = await fetchGithubUserID(accessToken);

	// Generate a username based on the userID and sign the user in.
	const username = hmac(locals.config.secretKey, userID);
	const sessionToken = await locals.command.auth.signIn(username);

	// Set a permanent cookie after sign in.
	cookies.set(SESSION_COOKIE_NAME, sessionToken, permanentCookieOptions(SESSION_EXPIRY_SECONDS));

	redirect(303, "/");
};
