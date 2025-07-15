import { redirect } from "@sveltejs/kit";

import { isValidUUID } from "$lib/server/utils";
import { errorBadRequest, errorUnauthorized } from "$lib/server/web/errors";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const account = locals.account;
	if (!account) {
		redirect(303, "/signin");
	}

	if (!account.isAdmin) {
		errorUnauthorized();
	}

	const accounts = await locals.query.account.list();
	return { accounts };
};

export const actions = {
	default: async ({ locals, request }) => {
		const account = locals.account;
		if (!account) {
			redirect(303, "/signin");
		}

		if (!account.isAdmin) {
			errorUnauthorized();
		}

		const data = await request.formData();
		const accountID = data.get("accountID")?.toString();
		if (!accountID) {
			errorBadRequest();
		}

		if (!isValidUUID(accountID)) {
			errorBadRequest();
		}

		try {
			await locals.command.account.deleteAccount(accountID);
		} catch (error) {
			console.log(error);
			errorBadRequest();
		}

		redirect(303, "/accounts");
	},
} satisfies Actions;
