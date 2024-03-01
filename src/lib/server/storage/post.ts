import _ from "lodash";
import type postgres from "postgres";

import type { Post, PostWithBlogAndTags } from "$lib/types";

export type CreatePostParams = {
	url: string;
	title: string;
	updatedAt: Date;
	body: string | null;
	blogId: string;
};

export type UpdatePostParams = Partial<CreatePostParams>;

export type SearchPostsParams = {
	search?: string;
	limit?: number;
	offset?: number;
};

const columns = ["id", "url", "title", "updated_at", "body", "blog_id"];

export type PostStorage = {
	create: (params: CreatePostParams) => Promise<Post>;
	listByBlog: (blogId: string) => Promise<Post[]>;
	search: (params: SearchPostsParams) => Promise<PostWithBlogAndTags[]>;
	// TODO: Return Post | undefined
	readById: (id: string) => Promise<PostWithBlogAndTags | null>;
	readByUrl: (url: string) => Promise<Post | null>;
	update: (post: Post, params: UpdatePostParams) => Promise<void>;
	delete: (post: Post) => Promise<void>;
};

export class PostgresPostStorage {
	private sql: postgres.Sql;

	constructor(sql: postgres.Sql) {
		this.sql = sql;
	}

	async create(params: CreatePostParams): Promise<Post> {
		const created = await this.sql<Post[]>`
			INSERT INTO post ${this.sql(params)}
			RETURNING ${this.sql(columns)}
		`;
		return created[0];
	}

	async listByBlog(blogId: string): Promise<Post[]> {
		const posts = await this.sql<Post[]>`
			SELECT ${this.sql(columns)}
			FROM post
			WHERE blog_id = ${blogId}
			ORDER BY updated_at DESC
		`;
		return posts;
	}

	async search({ search, limit = 15, offset = 0 }: SearchPostsParams): Promise<PostWithBlogAndTags[]> {
		const posts = await this.sql<PostWithBlogAndTags[]>`
			SELECT
				post.id,
				post.url,
				post.title,
				post.updated_at,
				post.body,
				blog.id AS blog_id,
				blog.site_url AS blog_url,
				blog.title AS blog_title,
				array_remove(array_agg(tag.name ORDER BY ts_rank_cd(post.content_index, to_tsquery(tag.name)) DESC), NULL) AS tags
			FROM post
			INNER JOIN blog
				ON blog.id = post.blog_id
			LEFT JOIN tag
				ON to_tsquery(tag.name) @@ post.content_index
			${search ? this.sql`WHERE post.content_index @@ websearch_to_tsquery('english',  ${search})` : this.sql``}
			GROUP BY 1,2,3,4,5,6,7,8
			ORDER BY ${
				search
					? this.sql`ts_rank_cd(post.content_index, websearch_to_tsquery('english',  ${search})) DESC`
					: this.sql`post.updated_at DESC`
			}
			LIMIT ${limit}
			OFFSET ${offset}
		`;
		return posts;
	}

	async readById(id: string): Promise<PostWithBlogAndTags | null> {
		const posts = await this.sql<PostWithBlogAndTags[]>`
			SELECT
				post.id,
				post.url,
				post.title,
				post.updated_at,
				post.body,
				blog.id AS blog_id,
				blog.site_url AS blog_url,
				blog.title AS blog_title,
				array_remove(array_agg(tag.name ORDER BY ts_rank_cd(post.content_index, to_tsquery(tag.name)) DESC), NULL) AS tags
			FROM post
			INNER JOIN blog
				ON blog.id = post.blog_id
			LEFT JOIN tag
				ON to_tsquery(tag.name) @@ post.content_index
			WHERE post.id = ${id}
			GROUP BY 1,2,3,4,5,6,7,8
		`;
		if (posts.length !== 1) {
			return null;
		}
		return posts[0];
	}

	async readByUrl(url: string): Promise<Post | null> {
		const posts = await this.sql<Post[]>`
			SELECT ${this.sql(columns)}
			FROM post
			WHERE url = ${url}
		`;
		if (posts.length !== 1) {
			return null;
		}
		return posts[0];
	}

	async update(post: Post, params: UpdatePostParams) {
		// clone params here because defaults mutates the dest object
		const resolved = _.defaults(_.clone(params), post);
		await this.sql`
			UPDATE post
			SET ${this.sql(resolved, "url", "title", "updatedAt", "body")}
			WHERE id = ${post.id}
		`;
	}

	async delete(post: Post) {
		await this.sql`
			DELETE
			FROM post
			WHERE id = ${post.id}
		`;
	}
}
