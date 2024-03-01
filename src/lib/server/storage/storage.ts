import postgres from "postgres";

import { PostgresBlogStorage, type BlogStorage } from "./blog";
import { PostgresPostStorage, type PostStorage } from "./post";
import { PostgresTagStorage, type TagStorage } from "./tag";

const DEFAULT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

export type Storage = {
	blog: BlogStorage;
	post: PostStorage;
	tag: TagStorage;
};

export function connect(): Storage {
	const sql = postgres(process.env.DATABASE_URL || DEFAULT_DATABASE_URL, {
		idle_timeout: 20,
		max_lifetime: 60 * 30,
		transform: postgres.camel,
		onnotice: () => {},
	});

	const storage: Storage = {
		blog: new PostgresBlogStorage(sql),
		post: new PostgresPostStorage(sql),
		tag: new PostgresTagStorage(sql),
	};
	return storage;
}
