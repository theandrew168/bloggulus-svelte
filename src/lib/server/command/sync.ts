import type { FeedFetcher } from "../feed";
import type { Repository } from "../repository";
import { syncExistingBlog, syncNewBlog } from "./sync/utils";

export class SyncCommand {
	private _repo: Repository;
	private _feedFetcher: FeedFetcher;

	constructor(repo: Repository, feedFetcher: FeedFetcher) {
		this._repo = repo;
		this._feedFetcher = feedFetcher;
	}

	async syncBlog(feedURL: string): Promise<void> {
		await this._repo.asUnitOfWork(async (uow) => {
			const blog = await uow.blog.readByFeedURL(feedURL);
			if (blog) {
				await syncExistingBlog(uow, this._feedFetcher, blog);
			}

			await syncNewBlog(uow, this._feedFetcher, feedURL);
		});
	}

	async syncAllBlogs(): Promise<void> {
		const blogs = await this._repo.blog.list();

		// TODO: Sync in batches? Can look into p-limit.
		for (const blog of blogs) {
			await syncExistingBlog(this._repo, this._feedFetcher, blog);
		}
	}
}
