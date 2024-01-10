import type { PageServerLoad } from "./$types";

import { isValidUuid } from "$lib/utils";
import { readPostById } from "$lib/server/storage/post";
import { errorBadRequest, errorNotFound } from "$lib/server/errors";

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;
	if (!isValidUuid(id)) {
		throw errorBadRequest();
	}

	const post = await readPostById(id);
	if (!post) {
		throw errorNotFound();
	}
	return {
		post,
	};
};