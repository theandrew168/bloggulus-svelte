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

	async hideBlog(blogID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const blog = await uow.blog.readByID(blogID);
			if (!blog) {
				throw new BlogNotFoundError(blogID);
			}

			blog.isPublic = false;
			await uow.blog.update(blog);
		});
	}

	async showBlog(blogID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const blog = await uow.blog.readByID(blogID);
			if (!blog) {
				throw new BlogNotFoundError(blogID);
			}

			blog.isPublic = true;
			await uow.blog.update(blog);
		});
	}
}
