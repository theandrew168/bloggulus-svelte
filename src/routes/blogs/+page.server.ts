import { redirect } from "@sveltejs/kit";

import { isValidUUID } from "$lib/server/utils";
import { NOTIFICATION_COOKIE_NAME, sessionCookieOptions } from "$lib/server/web/cookies";
import { errorBadRequest } from "$lib/server/web/errors";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const account = locals.account;
	if (!account) {
		redirect(303, "/signin");
	}

	const blogs = account.isAdmin
		? await locals.query.blog.listAll(account)
		: await locals.query.blog.listVisible(account);
	return { blogs };
};

export const actions = {
	add: async ({ cookies, locals, request }) => {
		const account = locals.account;
		if (!account) {
			redirect(303, "/signin");
		}

		const data = await request.formData();
		const maybeFeedURL = data.get("feedURL")?.toString();
		if (!maybeFeedURL) {
			errorBadRequest();
		}

		let feedURL: URL;
		try {
			feedURL = new URL(maybeFeedURL);
		} catch (error) {
			console.log("Invalid feed URL:", maybeFeedURL, error);
			errorBadRequest();
		}

		locals.command.sync
			.syncBlog(feedURL)
			.then(async () => {
				const blog = await locals.query.blog.readDetailsByFeedURL(maybeFeedURL);
				if (!blog) {
					return;
				}

				await locals.command.account.followBlog(account.id, blog.id);
			})
			.catch((error) => {
				console.error("Failed to add blog:", error);
			});

		// Show a notification explaining that the blog will be processed in the background.
		cookies.set(
			NOTIFICATION_COOKIE_NAME,
			"Once processed, this blog will be added and followed. Check back soon!",
			sessionCookieOptions(),
		);

		redirect(303, "/blogs");
	},
	follow: async ({ locals, request }) => {
		const account = locals.account;
		if (!account) {
			redirect(303, "/signin");
		}

		const data = await request.formData();
		const blogID = data.get("blogID")?.toString();
		if (!blogID) {
			errorBadRequest();
		}

		if (!isValidUUID(blogID)) {
			errorBadRequest();
		}

		await locals.command.account.followBlog(account.id, blogID);

		redirect(303, "/blogs");
	},
	unfollow: async ({ locals, request }) => {
		const account = locals.account;
		if (!account) {
			redirect(303, "/signin");
		}

		const data = await request.formData();
		const blogID = data.get("blogID")?.toString();
		if (!blogID) {
			errorBadRequest();
		}

		if (!isValidUUID(blogID)) {
			errorBadRequest();
		}

		await locals.command.account.unfollowBlog(account.id, blogID);

		redirect(303, "/blogs");
	},
} satisfies Actions;
