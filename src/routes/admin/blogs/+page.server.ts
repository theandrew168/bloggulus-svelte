import { error, type Actions } from "@sveltejs/kit";

import type { Blog } from "$lib/types";
import { sync } from "$lib/server/sync";
import sql from "$lib/server/db";

export async function load() {
	const blogs = await sql<Blog[]>`
		SELECT *
		FROM blog
	`;
	return {
		blogs,
	};
}

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

		const blogs = await sql<Blog[]>`
			SELECT *
			FROM blog
			WHERE id = ${id.toString()}
		`;
		if (blogs.length === 0) {
			error(404, {
				message: "Not Found",
			});
			return;
		}
		const blog = blogs[0];

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
