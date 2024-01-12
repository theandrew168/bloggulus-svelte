import type { Actions, PageServerLoad } from "./$types";

import { isValidUuid } from "$lib/utils";
import { deleteBlogById, readBlogById } from "$lib/server/storage/blog";
import { listPostsByBlog } from "$lib/server/storage/post";
import { errorBadRequest, errorNotFound } from "$lib/server/errors";
import { sync } from "$lib/server/sync";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;
	if (!isValidUuid(id)) {
		errorBadRequest();
	}

	const blog = await readBlogById(id);
	if (!blog) {
		errorNotFound();
	}
	const posts = await listPostsByBlog(blog.id);
	return {
		blog,
		posts,
	};
};

export const actions: Actions = {
	sync: async ({ request }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			errorBadRequest();
		}

		const blog = await readBlogById(id.toString());
		if (!blog) {
			errorNotFound();
		}

		sync(blog.feedUrl)
			.then(() => {
				console.log("sync success");
			})
			.catch(() => {
				console.log("sync failure");
			});
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			errorBadRequest();
		}

		const blog = await readBlogById(id.toString());
		if (!blog) {
			errorNotFound();
		}

		await deleteBlogById(blog.id);
		redirect(303, "/admin/blogs");
	},
};
