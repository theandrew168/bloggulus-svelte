import type { UUID } from "node:crypto";

import { Account } from "$lib/server/domain/account";
import type { AccountRepository } from "$lib/server/domain/repository";
import { Connection } from "$lib/server/postgres/connection";

type AccountRow = {
	id: UUID;
	username: string;
	is_admin: boolean;
	followed_blog_ids: UUID[];
};

export class PostgresAccountRepository implements AccountRepository {
	private static _instance?: PostgresAccountRepository;
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	static getInstance(): PostgresAccountRepository {
		if (!this._instance) {
			const conn = Connection.getInstance();
			this._instance = new PostgresAccountRepository(conn);
		}

		return this._instance;
	}

	async readByID(id: UUID): Promise<Account | undefined> {
		const rows = await this._conn.sql<AccountRow[]>`
			SELECT
				account.id,
				account.username,
				account.is_admin,
				ARRAY_AGG(account_blog.blog_id) AS followed_blog_ids
			FROM account
			LEFT JOIN account_blog
				ON account_blog.account_id = account.id
			WHERE account.id = ${id}
			GROUP BY account.id;
		`;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Account.load({
			id: row.id,
			username: row.username,
			isAdmin: row.is_admin,
			followedBlogIDs: row.followed_blog_ids,
		});
	}

	async readByUsername(username: string): Promise<Account | undefined> {
		const rows = await this._conn.sql<AccountRow[]>`
			SELECT
				account.id,
				account.username,
				account.is_admin,
				ARRAY_AGG(account_blog.blog_id) AS followed_blog_ids
			FROM account
			LEFT JOIN account_blog
				ON account_blog.account_id = account.id
			WHERE account.username = ${username}
			GROUP BY account.id;
		`;

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Account.load({
			id: row.id,
			username: row.username,
			isAdmin: row.is_admin,
			followedBlogIDs: row.followed_blog_ids,
		});
	}

	async createOrUpdate(account: Account): Promise<void> {
		await this._conn.sql`
			INSERT INTO account
                (id, username, is_admin)
            VALUES
                (${account.id}, ${account.username}, ${account.isAdmin})
            ON CONFLICT (id)
			DO UPDATE SET
				username = EXCLUDED.username,
				is_admin = EXCLUDED.is_admin;
		`;

		const followedBlogIDRows = await this._conn.sql<{ blog_id: UUID }[]>`
			SELECT blog_id
			FROM account_blog
			WHERE account_id = ${account.id};
		`;
		const followedBlogIDs = followedBlogIDRows.map((row) => row.blog_id);

		const blogsToFollow = account.followedBlogIDs.filter((blogID) => !followedBlogIDs.includes(blogID));
		for (const blogID of blogsToFollow) {
			await this._conn.sql`
				INSERT INTO account_blog
					(account_id, blog_id)
				VALUES
					(${account.id}, ${blogID});
			`;
		}

		const blogsToUnfollow = followedBlogIDs.filter((blogID) => !account.followedBlogIDs.includes(blogID));
		for (const blogID of blogsToUnfollow) {
			await this._conn.sql`
				DELETE FROM account_blog
				WHERE account_id = ${account.id} AND blog_id = ${blogID};
			`;
		}
	}

	async delete(account: Account): Promise<void> {
		await this._conn.sql`
			DELETE
			FROM account
			WHERE id = ${account.id};
		`;
	}
}
