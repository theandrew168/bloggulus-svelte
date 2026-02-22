/**
 * Name of cookie used to store the session ID.
 */
export const SESSION_COOKIE_NAME = "bloggulus_session";

/**
 * Name of cookie used to store the OAuth state.
 */
export const OAUTH_STATE_COOKIE_NAME = "bloggulus_oauth_state";

/**
 * Name of cookie used to store the OAuth code verifier.
 */
export const OAUTH_CODE_VERIFIER_COOKIE_NAME = "bloggulus_oauth_code_verifier";

/**
 * Name of cookie used to store the current notification message.
 */
export const NOTIFICATION_COOKIE_NAME = "bloggulus_notification";

/**
 * Returns the default options for session cookies.
 */
export function sessionCookieOptions() {
	return {
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "lax",
	} as const;
}

/**
 * Returns the default options for a permanent (not session) cookie with a given max age.
 */
export function permanentCookieOptions(maxAge: number) {
	return {
		...sessionCookieOptions(),
		maxAge,
	};
}
