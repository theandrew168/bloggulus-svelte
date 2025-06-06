import type { UUID } from "node:crypto";

import type { Tag } from "../tag";

export type TagRepository = {
	readByID: (id: UUID) => Promise<Tag | undefined>;
	createOrUpdate: (tag: Tag) => Promise<void>;
	delete: (tag: Tag) => Promise<void>;
};
