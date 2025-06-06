import Chance from "chance";
import { describe, expect, test } from "vitest";

import { Tag } from "$lib/server/tag";

import { PostgresTagRepository } from "./tag";

describe("PostgresTagRepository", () => {
	const chance = new Chance();
	const tagRepo = PostgresTagRepository.getInstance();

	test("createOrUpdate", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await tagRepo.createOrUpdate(tag);
	});

	test("readByID", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await tagRepo.createOrUpdate(tag);

		const tagByID = await tagRepo.readByID(tag.id);
		expect(tagByID?.id).toEqual(tag.id);
	});

	test("delete", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await tagRepo.createOrUpdate(tag);

		await tagRepo.delete(tag);

		const tagByID = await tagRepo.readByID(tag.id);
		expect(tagByID).toBeUndefined();
	});
});
