import type { Actions, PageServerLoad } from "./$types";

import { listBlogs } from "$lib/server/storage/blog";
import { sync } from "$lib/server/sync";
import { errorBadRequest, errorNotFound } from "$lib/server/errors";

export const load: PageServerLoad = async () => {
	const blogs = await listBlogs();
	return {
		blogs,
	};
};

export const actions: Actions = {
	add: async ({ request }) => {
		const data = await request.formData();
		const url = data.get("url");
		if (!url) {
			throw errorBadRequest();
		}

		sync(url.toString())
			.then(() => {
				console.log("sync success");
			})
			.catch((e) => {
				console.error(e);
				console.log("sync failure");
			});
	},
};
