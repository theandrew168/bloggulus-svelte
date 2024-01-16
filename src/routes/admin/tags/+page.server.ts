import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { createTag, deleteTag, listTags, readTagById } from "$lib/server/storage/tag";
import { errorBadRequest, errorNotFound } from "$lib/server/errors";

export const load: PageServerLoad = async () => {
	const tags = await listTags();
	return {
		tags,
	};
};

export const actions: Actions = {
	add: async ({ request }) => {
		const data = await request.formData();
		const name = data.get("name");
		if (!name) {
			throw errorBadRequest();
		}

		await createTag({ name: name.toString() });
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			throw errorBadRequest();
		}

		const tag = await readTagById(id.toString());
		if (!tag) {
			throw errorNotFound();
		}

		await deleteTag(tag);
	},
};
