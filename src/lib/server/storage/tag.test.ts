import _ from "lodash";
import { describe, expect, test } from "vitest";

import { isValidUuid } from "$lib/utils";
import { generateFakeTag } from "./fake";
import { connect } from "./storage";

describe("TagStorage", () => {
	const storage = connect();

	test("createTag", async () => {
		const params = generateFakeTag();

		const tag = await storage.tag.create(params);
		expect(isValidUuid(tag.id)).toEqual(true);
		expect(_.omit(tag, "id")).toEqual(params);
	});

	test("listTags", async () => {
		const tags = await Promise.all([
			storage.tag.create(generateFakeTag()),
			storage.tag.create(generateFakeTag()),
			storage.tag.create(generateFakeTag()),
		]);

		const got = await storage.tag.list();
		const ids = got.map((tag) => tag.id);
		for (const tag of tags) {
			expect(ids.includes(tag.id)).toEqual(true);
		}
	});

	test("readTagById", async () => {
		const params = generateFakeTag();
		const tag = await storage.tag.create(params);
		const got = await storage.tag.readById(tag.id);
		expect(got?.id).toEqual(tag.id);
	});

	test("deleteTag", async () => {
		const params = generateFakeTag();
		const tag = await storage.tag.create(params);
		await storage.tag.delete(tag);
		const got = await storage.tag.readById(tag.id);
		expect(got).toBeNull;
	});
});
