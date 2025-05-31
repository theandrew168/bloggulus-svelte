import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Tag } from "$lib/server/domain/tag";

import { PostgresTagRepository } from "./tag";

describe("PostgresTagRepository", () => {
	const chance = new Chance();
	const repo = PostgresTagRepository.getInstance();

	test("createOrUpdate", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.createOrUpdate(tag);
	});

	test("readById", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.createOrUpdate(tag);

		const tagById = await repo.readByID(tag.id);
		expect(tagById?.id).toEqual(tag.id);
	});

	test("delete", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.createOrUpdate(tag);

		await repo.delete(tag);

		const tagById = await repo.readByID(tag.id);
		expect(tagById).toBeUndefined();
	});
});
