import type { Account, Article } from "$lib/types";

export type ArticleWebQuery = {
	// Powers the index page.
	countRecent: () => Promise<number>;
	// Powers the index page.
	listRecent: (limit: number, offset: number) => Promise<Article[]>;
	// Powers the index page.
	countRecentByAccount: (account: Account) => Promise<number>;
	// Powers the index page.
	listRecentByAccount: (account: Account, limit: number, offset: number) => Promise<Article[]>;

	// Powers the index page (when searching).
	countRelevant: (search: string) => Promise<number>;
	// Powers the index page (when searching).
	listRelevant: (search: string, limit: number, offset: number) => Promise<Article[]>;
	// Powers the index page (when searching).
	countRelevantByAccount: (account: Account, search: string) => Promise<number>;
	// Powers the index page (when searching).
	listRelevantByAccount: (account: Account, search: string, limit: number, offset: number) => Promise<Article[]>;
};
