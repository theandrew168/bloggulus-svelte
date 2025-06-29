import { Account } from "$lib/server/account";
import { Connection } from "$lib/server/postgres";
import type { AccountRepository } from "$lib/server/repository/account";
import type { UUID } from "$lib/types";

type AccountRow = {
	id: UUID;
	username: string;
	is_admin: boolean;
	created_at: Date;
	updated_at: Date;
	followed_blog_ids: UUID[];
};

export class PostgresAccountRepository implements AccountRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(account: Account): Promise<void> {
		await this._conn.sql`
			INSERT INTO account
                (id, username, is_admin, created_at, updated_at)
            VALUES (
				${account.id},
				${account.username},
				${account.isAdmin},
				${account.createdAt},
				${account.updatedAt}
			);
		`;
	}

	async readByID(id: UUID): Promise<Account | undefined> {
		const rows = await this._conn.sql<AccountRow[]>`
			SELECT
				account.id,
				account.username,
				account.is_admin,
				account.created_at,
				account.updated_at,
				ARRAY_REMOVE(ARRAY_AGG(account_blog.blog_id), NULL) AS followed_blog_ids
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
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			followedBlogIDs: new Set(row.followed_blog_ids),
		});
	}

	async readByUsername(username: string): Promise<Account | undefined> {
		const rows = await this._conn.sql<AccountRow[]>`
			SELECT
				account.id,
				account.username,
				account.is_admin,
				account.created_at,
				account.updated_at,
				ARRAY_REMOVE(ARRAY_AGG(account_blog.blog_id), NULL) AS followed_blog_ids
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
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			followedBlogIDs: new Set(row.followed_blog_ids),
		});
	}

	async update(account: Account): Promise<void> {
		const followedBlogIDRows = await this._conn.sql<{ blog_id: UUID }[]>`
			SELECT blog_id
			FROM account_blog
			WHERE account_id = ${account.id};
		`;
		const followedBlogIDs = new Set(followedBlogIDRows.map((row) => row.blog_id));

		const blogsToFollow = account.followedBlogIDs.difference(followedBlogIDs);
		for (const blogID of blogsToFollow) {
			await this._conn.sql`
				INSERT INTO account_blog
					(account_id, blog_id)
				VALUES
					(${account.id}, ${blogID});
			`;
		}

		const blogsToUnfollow = followedBlogIDs.difference(account.followedBlogIDs);
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
