import type { PostDetails, UUID } from "$lib/types";

export type PostWebQuery = {
	// Powers the post details page (admin only).
	readDetailsByID: (postID: UUID) => Promise<PostDetails | undefined>;
	// Powers the blog details page (admin only).
	listDetailsByBlogID: (blogID: UUID) => Promise<PostDetails[]>;
};
