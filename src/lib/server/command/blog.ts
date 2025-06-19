import type { UUID } from "$lib/types";

import type { Repository } from "../repository";

export class BlogCommand {
	private _repo: Repository;

	constructor(repo: Repository) {
		this._repo = repo;
	}

	async deleteBlog(blogID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const blog = await uow.blog.readByID(blogID);
			if (!blog) {
				throw new Error(`Blog does not exist with ID: ${blogID}.`);
			}

			await uow.blog.delete(blog);
		});
	}
}
