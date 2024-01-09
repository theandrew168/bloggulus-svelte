import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { readBlogById } from "$lib/server/storage/blog";
import { listPostsByBlog } from "$lib/server/storage/post";

export const load: PageServerLoad = async ({ params }) => {
	const blog = await readBlogById(params.id);
	if (!blog) {
		error(404, {
			message: "Not Found",
		});
		return { posts: [] };
	}
	const posts = await listPostsByBlog(blog.id);
	return {
		blog,
		posts,
	};
};
