import { SQL } from "sql-template-strings";

import { Account } from "$lib/server/account";
import { Connection } from "$lib/server/postgres";
import type { UUID } from "$lib/types";

import { ConcurrentUpdateError } from "./errors";

type AccountRow = {
	id: UUID;
	username: string;
	is_admin: boolean;
	meta_created_at: Date;
	meta_updated_at: Date;
	meta_version: number;
	followed_blog_ids: UUID[];
};

export class AccountRepository {
	private _conn: Connection;

	constructor(conn: Connection) {
		this._conn = conn;
	}

	async create(account: Account): Promise<void> {
		await this._conn.query(SQL`
			INSERT INTO account
                (id, username, is_admin, meta_created_at, meta_updated_at, meta_version)
            VALUES (
				${account.id},
				${account.username},
				${account.isAdmin},
				${account.metaCreatedAt},
				${account.metaUpdatedAt},
				${account.metaVersion}
			);
		`);
	}

	async readByID(id: UUID): Promise<Account | undefined> {
		const { rows } = await this._conn.query<AccountRow>(SQL`
			SELECT
				account.id,
				account.username,
				account.is_admin,
				account.meta_created_at,
				account.meta_updated_at,
				account.meta_version,
				ARRAY_REMOVE(ARRAY_AGG(account_blog.blog_id), NULL) AS followed_blog_ids
			FROM account
			LEFT JOIN account_blog
				ON account_blog.account_id = account.id
			WHERE account.id = ${id}
			GROUP BY account.id;
		`);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Account.load({
			id: row.id,
			username: row.username,
			isAdmin: row.is_admin,
			metaCreatedAt: row.meta_created_at,
			metaUpdatedAt: row.meta_updated_at,
			metaVersion: row.meta_version,
			followedBlogIDs: new Set(row.followed_blog_ids),
		});
	}

	async readByUsername(username: string): Promise<Account | undefined> {
		const { rows } = await this._conn.query<AccountRow>(SQL`
			SELECT
				account.id,
				account.username,
				account.is_admin,
				account.meta_created_at,
				account.meta_updated_at,
				account.meta_version,
				ARRAY_REMOVE(ARRAY_AGG(account_blog.blog_id), NULL) AS followed_blog_ids
			FROM account
			LEFT JOIN account_blog
				ON account_blog.account_id = account.id
			WHERE account.username = ${username}
			GROUP BY account.id;
		`);

		const row = rows[0];
		if (!row) {
			return undefined;
		}

		return Account.load({
			id: row.id,
			username: row.username,
			isAdmin: row.is_admin,
			metaCreatedAt: row.meta_created_at,
			metaUpdatedAt: row.meta_updated_at,
			metaVersion: row.meta_version,
			followedBlogIDs: new Set(row.followed_blog_ids),
		});
	}

	async update(account: Account): Promise<void> {
		const newUpdatedAt = new Date();
		const newVersion = account.metaVersion + 1;

		const { rows } = await this._conn.query(SQL`
			UPDATE account
			SET
				is_admin = ${account.isAdmin},
				meta_updated_at = ${newUpdatedAt},
				meta_version = ${newVersion}
			WHERE id = ${account.id}
				AND meta_version = ${account.metaVersion}
			RETURNING id;
		`);

		if (rows.length !== 1) {
			throw new ConcurrentUpdateError("Account", account.id);
		}

		const { rows: followedBlogIDRows } = await this._conn.query<{ blog_id: UUID }>(SQL`
			SELECT blog_id
			FROM account_blog
			WHERE account_id = ${account.id};
		`);
		const followedBlogIDs = new Set(followedBlogIDRows.map((row) => row.blog_id));

		const blogsToFollow = account.followedBlogIDs.difference(followedBlogIDs);
		for (const blogID of blogsToFollow) {
			await this._conn.query(SQL`
				INSERT INTO account_blog
					(account_id, blog_id)
				VALUES
					(${account.id}, ${blogID});
			`);
		}

		const blogsToUnfollow = followedBlogIDs.difference(account.followedBlogIDs);
		for (const blogID of blogsToUnfollow) {
			await this._conn.query(SQL`
				DELETE FROM account_blog
				WHERE account_id = ${account.id} AND blog_id = ${blogID};
			`);
		}

		account.metaUpdatedAt = newUpdatedAt;
		account.metaVersion = newVersion;
	}

	async delete(account: Account): Promise<void> {
		await this._conn.query(SQL`
			DELETE
			FROM account
			WHERE id = ${account.id};
		`);
	}
}
