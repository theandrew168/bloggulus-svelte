import type { UUID } from "node:crypto";

import type { Repository } from "../repository/repository";

export class AccountCommand {
	private _repo: Repository;

	constructor(repo: Repository) {
		this._repo = repo;
	}

	async followBlog(accountID: UUID, blogID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const account = await uow.account.readByID(accountID);
			if (!account) {
				throw new Error(`Account not found with ID: ${accountID}.`);
			}

			const blog = await uow.blog.readByID(blogID);
			if (!blog) {
				throw new Error(`Blog not found with ID: ${blogID}.`);
			}

			account.followBlog(blog.id);
			await uow.account.createOrUpdate(account);
		});
	}

	async unfollowBlog(accountID: UUID, blogID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const account = await uow.account.readByID(accountID);
			if (!account) {
				throw new Error(`Account not found with ID: ${accountID}.`);
			}

			const blog = await uow.blog.readByID(blogID);
			if (!blog) {
				throw new Error(`Blog not found with ID: ${blogID}.`);
			}

			account.unfollowBlog(blog.id);
			await uow.account.createOrUpdate(account);
		});
	}

	async deleteAccount(accountID: UUID): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const account = await uow.account.readByID(accountID);
			if (!account) {
				throw new Error(`Account does not exist with ID: ${accountID}.`);
			}

			await uow.account.delete(account);
		});
	}
}
