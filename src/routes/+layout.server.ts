import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const sessionToken = cookies.get("bloggulus_session");
	if (!sessionToken) {
		return {};
	}

	const account = await locals.query.readAccountBySessionToken(sessionToken);
	return { account };
};
