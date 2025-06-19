import type { UUID } from "$lib/types";

import type { Repository } from "../repository";

export class PostCommand {
	private _repo: Repository;
	constructor(repo: Repository) {
		this._repo = repo;
	}

	async deletePost(postID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const post = await uow.post.readByID(postID);
			if (!post) {
				throw new Error(`Post does not exist with ID: ${postID}.`);
			}

			await uow.post.delete(post);
		});
	}
}
