import type { FeedFetcher } from "../feed/fetch";
import type { Repository } from "../repository/repository";
import { syncExistingBlog, syncNewBlog } from "./sync/utils";

export async function syncBlog(repo: Repository, feedFetcher: FeedFetcher, feedURL: string): Promise<void> {
	await repo.asUnitOfWork(async (uow) => {
		const blog = await uow.blog.readByFeedURL(feedURL);
		if (blog) {
			await syncExistingBlog(uow, feedFetcher, blog);
		}

		await syncNewBlog(uow, feedFetcher, feedURL);
	});
}

export async function syncAllBlogs(repo: Repository, feedFetcher: FeedFetcher): Promise<void> {
	const blogs = await repo.blog.list();

	// TODO: Sync in batches? Can look into p-limit.
	for (const blog of blogs) {
		await syncExistingBlog(repo, feedFetcher, blog);
	}
}
