import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { isValidUuid } from "$lib/utils";
import { errorBadRequest, errorNotFound } from "$lib/server/errors";

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = params.id;
	if (!isValidUuid(id)) {
		errorBadRequest();
	}

	const post = await locals.storage.post.readById(id);
	if (!post) {
		errorNotFound();
	}
	return {
		post,
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			errorBadRequest();
		}

		const post = await locals.storage.post.readById(id.toString());
		if (!post) {
			errorNotFound();
		}

		await locals.storage.post.delete(post);
		redirect(303, `/admin/blogs/${post.blogId}`);
	},
};
