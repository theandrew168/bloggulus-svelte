import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const account = locals.account;

	// Check for and clear any existing notifications.
	const notification = cookies.get("bloggulus_notification");
	cookies.delete("bloggulus_notification", {
		path: "/",
	});

	return { account, notification };
};
