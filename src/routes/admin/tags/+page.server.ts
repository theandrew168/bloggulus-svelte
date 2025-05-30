import type { Actions } from "@sveltejs/kit";

import { errorBadRequest, errorNotFound } from "$lib/server/errors";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const tags = await locals.storage.tag.list();
	return {
		tags,
	};
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const data = await request.formData();
		const name = data.get("name");
		if (!name) {
			throw errorBadRequest();
		}

		await locals.storage.tag.create({ name: name.toString() });
	},
	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			throw errorBadRequest();
		}

		const tag = await locals.storage.tag.readById(id.toString());
		if (!tag) {
			throw errorNotFound();
		}

		await locals.storage.tag.delete(tag);
	},
};
