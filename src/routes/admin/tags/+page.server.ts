import { error, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { createTag, deleteTag, listTags, readTagById } from "$lib/server/storage/tag";

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
			error(400, {
				message: "Bad Request",
			});
			return;
		}

		await createTag({ name: name.toString() });
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get("id");
		if (!id) {
			error(400, {
				message: "Bad Request",
			});
			return;
		}

		const tag = await readTagById(id.toString());
		if (!tag) {
			error(404, {
				message: "Not Found",
			});
			return;
		}

		console.log(tag);
		await deleteTag(tag.id);
	},
};
