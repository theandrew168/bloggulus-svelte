import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Tag } from "$lib/server/tag";

import { Repository } from ".";

describe("repository/tag", () => {
	const chance = new Chance();
	const repo = Repository.getInstance();

	test("create", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.tag.create(tag);
	});

	test("readByID", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.tag.create(tag);

		const tagByID = await repo.tag.readByID(tag.id);
		expect(tagByID?.id).toEqual(tag.id);
	});

	test("delete", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.tag.create(tag);

		await repo.tag.delete(tag);

		const tagByID = await repo.tag.readByID(tag.id);
		expect(tagByID).toBeUndefined();
	});
});
