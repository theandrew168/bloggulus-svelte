import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { isValidUuid } from "$lib/utils";
import { deletePostById, readPostById } from "$lib/server/storage/post";
import { errorBadRequest, errorNotFound } from "$lib/server/errors";

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;
	if (!isValidUuid(id)) {
		errorBadRequest();
	}

	const post = await readPostById(id);
	if (!post) {
		errorNotFound();
	}
	return {
		post,
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			errorBadRequest();
		}

		const post = await readPostById(id.toString());
		if (!post) {
			errorNotFound();
		}

		await deletePostById(post.id);
		redirect(303, `/admin/blogs/${post.blogId}`);
	},
};
