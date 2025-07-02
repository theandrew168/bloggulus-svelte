import pLimit from "p-limit";

import type { FeedFetcher } from "$lib/server/feed/fetch";
import { Repository } from "$lib/server/repository";

import { syncExistingBlog, syncNewBlog } from "./sync/utils";

export class SyncCommand {
	private _repo: Repository;
	private _feedFetcher: FeedFetcher;

	constructor(repo: Repository, feedFetcher: FeedFetcher) {
		this._repo = repo;
		this._feedFetcher = feedFetcher;
	}

	async syncBlog(feedURL: URL): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const blog = await uow.blog.readByFeedURL(feedURL);
			if (blog) {
				await syncExistingBlog(uow, this._feedFetcher, blog);
			} else {
				await syncNewBlog(uow, this._feedFetcher, feedURL);
			}
		});
	}

	async syncAllBlogs(): Promise<void> {
		console.log("Syncing all blogs...");
		const blogs = await this._repo.blog.list();

		const now = new Date();
		const syncableBlogs = blogs.filter((blog) => blog.canBeSynced(now));

		const limit = pLimit(4);
		const syncBlogPromises = syncableBlogs.map((blog) =>
			limit(() => syncExistingBlog(this._repo, this._feedFetcher, blog)),
		);
		await Promise.all(syncBlogPromises);
	}
}
