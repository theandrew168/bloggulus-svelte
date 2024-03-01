import type { Actions, PageServerLoad } from "./$types";

import { SyncService } from "$lib/server/sync";
import { errorBadRequest } from "$lib/server/errors";

export const load: PageServerLoad = async ({ locals }) => {
	const blogs = await locals.storage.blog.list();
	return {
		blogs,
	};
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const data = await request.formData();
		const url = data.get("url");
		if (!url) {
			errorBadRequest();
		}

		const syncService = new SyncService(locals.storage);
		syncService
			.syncBlog(url.toString())
			.then(() => {
				console.log("sync success");
			})
			.catch((e) => {
				console.error(e);
				console.log("sync failure");
			});
	},
};
