import { errorNotFound } from "$lib/server/web/errors";

import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ locals }) => {
	const account = locals.account;
	if (!account) {
		errorNotFound();
	}

	const blogs = await locals.query.listBlogs(account);
	return { blogs };
};
