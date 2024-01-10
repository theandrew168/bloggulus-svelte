import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { listBlogs, readBlogById } from "$lib/server/storage/blog";
import { sync } from "$lib/server/sync";
import { errorBadRequest, errorNotFound } from "$lib/server/errors";

export const load: PageServerLoad = async () => {
	const blogs = await listBlogs();
	return {
		blogs,
	};
};

export const actions: Actions = {
	sync: async ({ request }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			throw errorBadRequest();
		}

		const blog = await readBlogById(id.toString());
		if (!blog) {
			throw errorNotFound();
		}

		sync(blog.feedUrl)
			.then(() => {
				console.log("sync success");
			})
			.catch(() => {
				console.log("sync failure");
			});
	},
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
