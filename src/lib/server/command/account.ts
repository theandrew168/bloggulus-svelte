import type { UUID } from "$lib/types";

import type { Repository } from "../repository";
import { AccountNotFoundError, AdminAccountDeletionError, BlogNotFoundError } from "./errors";

export class AccountCommand {
	private _repo: Repository;

	constructor(repo: Repository) {
		this._repo = repo;
	}

	async followBlog(accountID: UUID, blogID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const account = await uow.account.readByID(accountID);
			if (!account) {
				throw new AccountNotFoundError(accountID);
			}

			const blog = await uow.blog.readByID(blogID);
			if (!blog) {
				throw new BlogNotFoundError(blogID);
			}

			account.followBlog(blog.id);
			await uow.account.update(account);
		});
	}

	async unfollowBlog(accountID: UUID, blogID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const account = await uow.account.readByID(accountID);
			if (!account) {
				throw new AccountNotFoundError(accountID);
			}

			const blog = await uow.blog.readByID(blogID);
			if (!blog) {
				throw new BlogNotFoundError(blogID);
			}

			account.unfollowBlog(blog.id);
			await uow.account.update(account);
		});
	}

	async deleteAccount(accountID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const account = await uow.account.readByID(accountID);
			if (!account) {
				throw new AccountNotFoundError(accountID);
			}

			if (account.isAdmin) {
				throw new AdminAccountDeletionError(accountID);
			}

			await uow.account.delete(account);
		});
	}
}
