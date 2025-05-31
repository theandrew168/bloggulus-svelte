import Chance from "chance";
import { describe, test } from "vitest";

import { Tag } from "$lib/server/domain/tag";

import { PostgresTagRepository } from "./tag";

describe("PostgresTagRepository", () => {
	const chance = new Chance();
	const repo = PostgresTagRepository.getInstance();

	test("createOrUpdate", async () => {
		const tag = new Tag({ name: chance.word({ length: 20 }) });
		await repo.createOrUpdate(tag);
	});
});
