import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Tag } from "$lib/server/tag";

import { PostgresRepository } from ".";

describe("repository/postgres/tag", () => {
	const chance = new Chance();
	const repo = PostgresRepository.getInstance();

	test("createOrUpdate", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.tag.createOrUpdate(tag);
	});

	test("readByID", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.tag.createOrUpdate(tag);

		const tagByID = await repo.tag.readByID(tag.id);
		expect(tagByID?.id).toEqual(tag.id);
	});

	test("delete", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.tag.createOrUpdate(tag);

		await repo.tag.delete(tag);

		const tagByID = await repo.tag.readByID(tag.id);
		expect(tagByID).toBeUndefined();
	});
});
