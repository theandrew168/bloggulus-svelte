import type { UUID } from "$lib/types";

import type { Tag } from "../tag";

export type TagRepository = {
	create: (tag: Tag) => Promise<void>;
	readByID: (id: UUID) => Promise<Tag | undefined>;
	delete: (tag: Tag) => Promise<void>;
};
