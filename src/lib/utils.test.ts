import { expect, test } from "vitest";

import { isValidUuid } from "./utils";

test.each([
	{ s: "3a83626c-a95c-47ac-9996-d6785122e1c1", expected: true },
	{ s: "3a83626c-a95c-47ac-9996-d6785122e1cZ", expected: false },
	{ s: "3a83626ca95c47ac9996d6785122e1c1", expected: false },
	{ s: "foobar", expected: false },
	{ s: "", expected: false },
])("isValidUuid($s) -> $expected", ({ s, expected }) => {
	expect(isValidUuid(s)).toEqual(expected);
});
