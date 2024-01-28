import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { isValidUuid } from "$lib/utils";
import { deleteBlog, readBlogById } from "$lib/server/storage/blog";
import { listPostsByBlog } from "$lib/server/storage/post";
import { errorBadRequest, errorNotFound } from "$lib/server/errors";
import { SyncService } from "$lib/server/sync";

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
	addPost: async ({ request }) => {
		const data = await request.formData();

		const url = data.get("url");
		if (!url) {
			errorBadRequest();
		}

		const id = data.get("id");
		if (!id) {
			errorBadRequest();
		}

		const blog = await readBlogById(id.toString());
		if (!blog) {
			errorNotFound();
		}

		console.log(id, url);
	},
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

		const syncService = new SyncService();
		syncService
			.syncBlog(blog.feedUrl)
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

		await deleteBlog(blog);
		redirect(303, "/admin/blogs");
	},
};
