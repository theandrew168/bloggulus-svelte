import _ from "lodash";
import { expect, test } from "vitest";

import { isValidUuid } from "$lib/utils";
import { createTag, listTags, readTagById, deleteTag } from "./tag";
import { generateFakeTag } from "./fake";
import db from "./db";

test("createTag", async () => {
	const params = generateFakeTag();

	const tag = await db.begin(async (tx) => {
		const tag = createTag(params, tx);
		await tx`rollback and chain`;
		return tag;
	});
	expect(isValidUuid(tag.id)).toEqual(true);
	expect(_.omit(tag, "id")).toEqual(params);
});

test("listTags", async () => {
	const tags = await Promise.all([
		createTag(generateFakeTag()),
		createTag(generateFakeTag()),
		createTag(generateFakeTag()),
	]);

	const got = await listTags();
	const ids = got.map((tag) => tag.id);
	for (const tag of tags) {
		expect(ids.includes(tag.id)).toEqual(true);
	}
});

test("readTagById", async () => {
	const params = generateFakeTag();
	const tag = await createTag(params);
	const got = await readTagById(tag.id);
	expect(got?.id).toEqual(tag.id);
});

test("deleteTag", async () => {
	const params = generateFakeTag();
	const tag = await createTag(params);
	await deleteTag(tag);
	const got = await readTagById(tag.id);
	expect(got).toBeNull;
});
