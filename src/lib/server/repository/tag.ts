import type { UUID } from "node:crypto";

import type { Tag } from "../tag";

export type TagRepository = {
	createOrUpdate: (tag: Tag) => Promise<void>;
	readByID: (id: UUID) => Promise<Tag | undefined>;
	delete: (tag: Tag) => Promise<void>;
};
