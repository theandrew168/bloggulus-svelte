import { redirect } from "@sveltejs/kit";

import { isValidUUID } from "$lib/server/utils";
import { errorBadRequest, errorNotFound, errorUnauthorized } from "$lib/server/web/errors";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	const postID = params.postID;
	if (!isValidUUID(postID)) {
		errorNotFound();
	}

	const account = locals.account;
	if (!account) {
		redirect(303, "/signin");
	}

	if (!account.isAdmin) {
		errorUnauthorized();
	}

	const post = await locals.query.readPostDetailsByID(postID);
	if (!post) {
		errorNotFound();
	}

	return { post };
};

export const actions = {
	default: async ({ locals, request, params }) => {
		const account = locals.account;
		if (!account) {
			redirect(303, "/signin");
		}

		if (!account.isAdmin) {
			errorUnauthorized();
		}

		const data = await request.formData();
		const postID = data.get("postID")?.toString();
		if (!postID) {
			errorBadRequest();
		}

		if (!isValidUUID(postID)) {
			errorBadRequest();
		}

		await locals.command.post.deletePost(postID);

		redirect(303, `/blogs/${params.blogID}`);
	},
} satisfies Actions;
