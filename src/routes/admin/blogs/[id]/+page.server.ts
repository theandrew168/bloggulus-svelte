import { redirect } from "@sveltejs/kit";

import { errorBadRequest, errorNotFound } from "$lib/server/errors";
import { SyncService } from "$lib/server/sync";
import { isValidUuid } from "$lib/utils";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = params.id;
	if (!isValidUuid(id)) {
		errorBadRequest();
	}

	const blog = await locals.storage.blog.readById(id);
	if (!blog) {
		errorNotFound();
	}
	const posts = await locals.storage.post.listByBlog(blog.id);
	return {
		blog,
		posts,
	};
};

export const actions: Actions = {
	addPost: async ({ request, locals }) => {
		const data = await request.formData();

		const url = data.get("url");
		if (!url) {
			errorBadRequest();
		}

		const id = data.get("id");
		if (!id) {
			errorBadRequest();
		}

		const blog = await locals.storage.blog.readById(id.toString());
		if (!blog) {
			errorNotFound();
		}

		console.log(id, url);
	},
	sync: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			errorBadRequest();
		}

		const blog = await locals.storage.blog.readById(id.toString());
		if (!blog) {
			errorNotFound();
		}

		const syncService = new SyncService(locals.storage);
		syncService
			.syncBlog(blog.feedUrl)
			.then(() => {
				console.log("sync success");
			})
			.catch(() => {
				console.log("sync failure");
			});
	},
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			errorBadRequest();
		}

		const blog = await locals.storage.blog.readById(id.toString());
		if (!blog) {
			errorNotFound();
		}

		await locals.storage.blog.delete(blog);
		redirect(303, "/admin/blogs");
	},
};
