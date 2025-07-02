import { Repository } from "$lib/server/repository";
import type { UUID } from "$lib/types";

import { BlogNotFoundError } from "./errors";

export class BlogCommand {
	private _repo: Repository;

	constructor(repo: Repository) {
		this._repo = repo;
	}

	async deleteBlog(blogID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const blog = await uow.blog.readByID(blogID);
			if (!blog) {
				throw new BlogNotFoundError(blogID);
			}

			await uow.blog.delete(blog);
		});
	}
}
