import type { Tag } from "$lib/types";
import sql from "./db";

export type CreateTagParams = {
	name: string;
};

export async function createTag({ name }: CreateTagParams): Promise<Tag> {
	const created = await sql<Tag[]>`
		INSERT INTO tag
			(name)
		VALUES
			(${name})
		RETURNING *
	`;
	return created[0];
}

export async function listTags(): Promise<Tag[]> {
	const tags = await sql<Tag[]>`
		SELECT *
		FROM tag
		ORDER BY name ASC
	`;
	return tags;
}

export async function readTagById(id: string): Promise<Tag | null> {
	const tags = await sql<Tag[]>`
		SELECT *
		FROM tag
		WHERE id = ${id}
	`;
	if (tags.length !== 1) {
		return null;
	}
	return tags[0];
}

export async function deleteTag(tag: Tag) {
	await sql`
		DELETE
		FROM tag
		WHERE id = ${tag.id}
	`;
}
