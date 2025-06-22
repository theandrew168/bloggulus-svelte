import { redirect } from "@sveltejs/kit";

import { isValidUUID, sessionCookieOptions } from "$lib/server/utils";
import { NOTIFICATION_COOKIE_NAME } from "$lib/server/web/cookies";
import { errorBadRequest, errorNotFound } from "$lib/server/web/errors";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const account = locals.account;
	if (!account) {
		redirect(303, "/signin");
	}

	const blogs = await locals.query.listBlogs(account);
	return { blogs };
};

export const actions = {
	add: async ({ cookies, locals, request }) => {
		const account = locals.account;
		if (!account) {
			redirect(303, "/signin");
		}

		const data = await request.formData();
		const feedURL = data.get("feedURL")?.toString();
		if (!feedURL) {
			errorBadRequest();
		}

		// TODO: Where should this validation be done? Perhaps syncBlog should accept a URL object instead?
		// Feels very "parse, don't validate" to me.
		try {
			new URL(feedURL);
		} catch {
			errorBadRequest();
		}

		locals.command.sync
			.syncBlog(feedURL)
			.then(async () => {
				const blog = await locals.query.readBlogDetailsByFeedURL(feedURL);
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
