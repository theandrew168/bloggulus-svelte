import { redirect } from "@sveltejs/kit";

import { isValidUUID } from "$lib/server/utils";
import { errorBadRequest, errorNotFound, errorUnauthorized } from "$lib/server/web/errors";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
	const blogID = params.blogID;
	if (!isValidUUID(blogID)) {
		errorNotFound();
	}

	const account = locals.account;
	if (!account) {
		errorNotFound();
	}

	if (!account.isAdmin) {
		errorUnauthorized();
	}

	const [blog, posts] = await Promise.all([
		locals.query.readBlogDetailsByID(blogID),
		locals.query.listPostDetailsByBlogID(blogID),
	]);

	if (!blog) {
		errorNotFound();
	}

	return { blog, posts };
};

export const actions = {
	default: async ({ locals, request }) => {
		const account = locals.account;
		if (!account) {
			errorNotFound();
		}

		if (!account.isAdmin) {
			errorUnauthorized();
		}

		const data = await request.formData();
		const blogID = data.get("blogID")?.toString();
		if (!blogID) {
			errorBadRequest();
		}

		if (!isValidUUID(blogID)) {
			errorBadRequest();
		}

		await locals.command.blog.deleteBlog(blogID);

		redirect(303, "/blogs");
	},
} satisfies Actions;
