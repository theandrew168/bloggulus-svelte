import type { PageServerLoad } from "./$types";

import { isValidUuid } from "$lib/utils";
import { readBlogById } from "$lib/server/storage/blog";
import { listPostsByBlog } from "$lib/server/storage/post";
import { errorBadRequest, errorNotFound } from "$lib/server/errors";

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id;
	if (!isValidUuid(id)) {
		throw errorBadRequest();
	}

	const blog = await readBlogById(id);
	if (!blog) {
		throw errorNotFound();
	}
	const posts = await listPostsByBlog(blog.id);
	return {
		blog,
		posts,
	};
};
