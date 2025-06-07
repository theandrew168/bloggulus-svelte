import type { UUID } from "node:crypto";

import type { Repository } from "../repository/repository";

export async function followBlog(repo: Repository, accountID: UUID, blogID: UUID): Promise<void> {
	await repo.asUnitOfWork(async (uow) => {
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

export async function unfollowBlog(repo: Repository, accountID: UUID, blogID: UUID): Promise<void> {
	await repo.asUnitOfWork(async (uow) => {
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

export async function deleteAccount(repo: Repository, accountID: UUID): Promise<void> {
	await repo.asUnitOfWork(async (uow) => {
		const account = await uow.account.readByID(accountID);
		if (!account) {
			throw new Error(`Account does not exist with ID: ${accountID}.`);
		}

		await uow.account.delete(account);
	});
}
