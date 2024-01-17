import _ from "lodash";
import { expect, test } from "vitest";
import { faker } from "@faker-js/faker";

import { createTag, listTags, type CreateTagParams, readTagById, deleteTag } from "./tag";
import { isValidUuid } from "$lib/utils";

function generateFakeTag(): CreateTagParams {
	const params: CreateTagParams = {
		name: faker.lorem.word(),
	};
	return params;
}

test("createTag", async () => {
	const params = generateFakeTag();
	const tag = await createTag(params);
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
