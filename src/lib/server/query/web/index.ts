import type { AccountWebQuery } from "./account";
import type { ArticleWebQuery } from "./article";
import type { BlogWebQuery } from "./blog";
import type { PostWebQuery } from "./post";

export type WebQuery = {
	readonly account: AccountWebQuery;
	readonly article: ArticleWebQuery;
	readonly blog: BlogWebQuery;
	readonly post: PostWebQuery;
};
