import { describe, expect, it, test } from "vitest";

import { isValidUUID } from "./utils";

describe("utils", () => {
	describe("isValidUUID", () => {
		it("should parse valid UUIDs", () => {
			expect(isValidUUID("3a83626c-a95c-47ac-9996-d6785122e1c1")).toBe(true);
			expect(isValidUUID("3a83626c-a95c-47ac-9996-d6785122e1c2")).toBe(true);
		});

		it("should reject invalid UUIDs", () => {
			expect(isValidUUID("3a83626c-a95c-47ac-9996-d6785122e1cZ")).toBe(false);
			expect(isValidUUID("3a83626ca95c47ac9996d6785122e1c1")).toBe(false);
			expect(isValidUUID("foobar")).toBe(false);
			expect(isValidUUID("")).toBe(false);
		});
	});
});
