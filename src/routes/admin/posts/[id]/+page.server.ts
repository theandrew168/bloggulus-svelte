import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { readPostById } from "$lib/server/storage/post";

export const load: PageServerLoad = async ({ params }) => {
	const post = await readPostById(params.id);
	if (!post) {
		error(404, {
			message: "Not Found",
		});
		return;
	}
	return {
		post,
	};
};
