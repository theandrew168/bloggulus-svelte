import { expect, test } from "vitest";

import { errorBadRequest, errorNotFound, errorUnauthorized } from "./errors";

test("errorBadRequest", async () => {
	expect(() => errorBadRequest()).toThrow();
});

test("errorUnauthorized", async () => {
	expect(() => errorUnauthorized()).toThrow();
});

test("errorNotFound", async () => {
	expect(() => errorNotFound()).toThrow();
});
