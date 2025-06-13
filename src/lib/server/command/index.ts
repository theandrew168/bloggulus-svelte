import type { FeedFetcher } from "../feed";
import { WebFeedFetcher } from "../feed/web";
import type { Repository } from "../repository";
import { PostgresRepository } from "../repository/postgres";
import { AccountCommand } from "./account";
import { AuthCommand } from "./auth";
import { BlogCommand } from "./blog";
import { PostCommand } from "./post";
import { SyncCommand } from "./sync";

export class Command {
	private static _instance?: Command;

	readonly account: AccountCommand;
	readonly auth: AuthCommand;
	readonly blog: BlogCommand;
	readonly post: PostCommand;
	readonly sync: SyncCommand;

	constructor(repo: Repository, feedFetcher: FeedFetcher) {
		this.account = new AccountCommand(repo);
		this.auth = new AuthCommand(repo);
		this.blog = new BlogCommand(repo);
		this.post = new PostCommand(repo);
		this.sync = new SyncCommand(repo, feedFetcher);
	}

	static getInstance(): Command {
		if (!this._instance) {
			const repo = PostgresRepository.getInstance();
			const feedFetcher = new WebFeedFetcher();
			this._instance = new Command(repo, feedFetcher);
		}

		return this._instance;
	}
}
