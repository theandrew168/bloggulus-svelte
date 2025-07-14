import { describe, expect, test } from "vitest";

import { Tag } from "$lib/server/tag";
import { randomTagParams } from "$lib/server/test";

import { Repository } from ".";

describe("repository/tag", () => {
	const repo = Repository.getInstance();

	test("create", async () => {
		const tag = new Tag(randomTagParams());
		await repo.tag.create(tag);
	});

	test("readByID", async () => {
		const tag = new Tag(randomTagParams());
		await repo.tag.create(tag);

		const tagByID = await repo.tag.readByID(tag.id);
		expect(tagByID?.id).toEqual(tag.id);
	});

	test("readByName", async () => {
		const tag = new Tag(randomTagParams());
		await repo.tag.create(tag);

		const tagByName = await repo.tag.readByName(tag.name);
		expect(tagByName?.id).toEqual(tag.id);
	});

	test("delete", async () => {
		const tag = new Tag(randomTagParams());
		await repo.tag.create(tag);

		await repo.tag.delete(tag);

		const tagByID = await repo.tag.readByID(tag.id);
		expect(tagByID).toBeUndefined();
	});
});
