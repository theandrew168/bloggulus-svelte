import { error, type Actions } from "@sveltejs/kit";

import prisma from "$lib/server/prisma";
import { sync } from "$lib/server/sync";

export async function load() {
	const blogs = await prisma.blog.findMany({
		orderBy: [{ title: "asc" }],
	});
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

		const blog = await prisma.blog.findUnique({
			where: { id: id.toString() },
		});
		if (!blog) {
			error(404, {
				message: "Not Found",
			});
			return;
		}

		sync(blog.feedURL)
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
			.catch(() => {
				console.log("sync failure");
			});
	},
};
