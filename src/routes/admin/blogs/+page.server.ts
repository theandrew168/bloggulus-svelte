import { error, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { listBlogs, readBlogById } from "$lib/server/storage/blog";
import { sync } from "$lib/server/sync";

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
			error(400, {
				message: "Bad Request",
			});
			return;
		}

		const blog = await readBlogById(id.toString());
		if (!blog) {
			error(404, {
				message: "Not Found",
			});
			return;
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
			error(400, {
				message: "Bad Request",
			});
			return;
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
