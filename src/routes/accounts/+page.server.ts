import { redirect } from "@sveltejs/kit";

import { isValidUUID } from "$lib/server/utils";
import { errorBadRequest, errorNotFound, errorUnauthorized } from "$lib/server/web/errors";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const account = locals.account;
	if (!account) {
		errorNotFound();
	}

	if (!account.isAdmin) {
		errorUnauthorized();
	}

	const accounts = await locals.query.listAccounts();
	return { accounts };
};

export const actions = {
	default: async ({ locals, request }) => {
		const account = locals.account;
		if (!account) {
			errorNotFound();
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
