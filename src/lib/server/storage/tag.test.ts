import _ from "lodash";
import { describe, expect, test } from "vitest";

import { isValidUuid } from "$lib/utils";
import { generateFakeTag } from "./fake";
import { connect } from "./storage";

describe("TagStorage", () => {
	const storage = connect();

	test("create", async () => {
		await storage.transaction(
			async (storage) => {
				const params = generateFakeTag();
				const tag = await storage.tag.create(params);
				expect(isValidUuid(tag.id)).toEqual(true);
				expect(_.omit(tag, "id")).toEqual(params);
			},
			{ commit: false },
		);
	});

	test("list", async () => {
		await storage.transaction(
			async (storage) => {
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
			},
			{ commit: false },
		);
	});

	test("readById", async () => {
		await storage.transaction(
			async (storage) => {
				const params = generateFakeTag();
				const tag = await storage.tag.create(params);
				const got = await storage.tag.readById(tag.id);
				expect(got?.id).toEqual(tag.id);
			},
			{ commit: false },
		);
	});

	test("delete", async () => {
		await storage.transaction(
			async (storage) => {
				const params = generateFakeTag();
				const tag = await storage.tag.create(params);
				await storage.tag.delete(tag);
				const got = await storage.tag.readById(tag.id);
				expect(got).toBeNull;
			},
			{ commit: false },
		);
	});
});
