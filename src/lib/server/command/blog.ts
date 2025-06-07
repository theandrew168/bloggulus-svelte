import type { UUID } from "node:crypto";

import type { Repository } from "../repository/repository";

export async function deleteBlog(repo: Repository, blogID: UUID): Promise<void> {
	await repo.asUnitOfWork(async (uow) => {
		const blog = await uow.blog.readByID(blogID);
		if (!blog) {
			throw new Error(`Blog does not exist with ID: ${blogID}.`);
		}

		await uow.blog.delete(blog);
	});
}
