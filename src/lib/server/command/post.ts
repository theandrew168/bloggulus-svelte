import type { UUID } from "node:crypto";

import type { Repository } from "../repository/repository";

export async function deletePost(repo: Repository, postID: UUID): Promise<void> {
	await repo.asUnitOfWork(async (uow) => {
		const post = await uow.post.readByID(postID);
		if (!post) {
			throw new Error(`Post does not exist with ID: ${postID}.`);
		}

		await uow.post.delete(post);
	});
}
