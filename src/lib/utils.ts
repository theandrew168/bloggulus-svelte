import type { UUID } from "node:crypto";

export function isValidUUID(s: string): s is UUID {
	const pattern = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
	return pattern.test(s);
}
