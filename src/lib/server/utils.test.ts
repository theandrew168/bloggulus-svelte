import { describe, expect, it } from "vitest";

import { hmac, isValidUUID, randomString, sha256 } from "./utils";

describe("utils", () => {
	describe("isValidUUID", () => {
		it("should parse valid UUIDs", () => {
			expect(isValidUUID("3a83626c-a95c-47ac-9996-d6785122e1c1")).toEqual(true);
			expect(isValidUUID("3a83626c-a95c-47ac-9996-d6785122e1c2")).toEqual(true);
		});

		it("should reject invalid UUIDs", () => {
			expect(isValidUUID("3a83626c-a95c-47ac-9996-d6785122e1cZ")).toEqual(false);
			expect(isValidUUID("3a83626ca95c47ac9996d6785122e1c1")).toEqual(false);
			expect(isValidUUID("foobar")).toEqual(false);
			expect(isValidUUID("")).toEqual(false);
		});
	});

	describe("randomString", () => {
		it("should generate a random base64-encoded string of the specified number of bytes", () => {
			expect(atob(randomString(16))).toHaveLength(16);
			expect(atob(randomString(32))).toHaveLength(32);
			expect(atob(randomString(64))).toHaveLength(64);
		});
	});

	describe("sha256", () => {
		it("should correctly hash strings using SHA256", async () => {
			expect(await sha256("")).toEqual("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
			expect(await sha256("foobar")).toEqual("c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2");
			expect(await sha256("hello world")).toEqual("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
		});
	});

	describe("hmac", () => {
		it("should correctly hash strings using HMAC-SHA256", async () => {
			const key = "secret";
			expect(await hmac(key, "")).toEqual("f9e66e179b6747ae54108f82f8ade8b3c25d76fd30afde6c395822c530196169");
			expect(await hmac(key, "foobar")).toEqual("4fcc06915b43d8a49aff193441e9e18654e6a27c2c428b02e8fcc41ccc2299f9");
			expect(await hmac(key, "hello world")).toEqual(
				"734cc62f32841568f45715aeb9f4d7891324e6d948e4c6c60c0621cdac48623a",
			);
		});
	});
});
