import { createHash, createHmac, randomBytes } from "node:crypto";

import type { UUID } from "$lib/types";

/**
 * Type guard to check if a string is a valid UUID.
 */
export function isValidUUID(s: string): s is UUID {
	const pattern = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
	return pattern.test(s);
}

/**
 * Generates a random base64-encoded string of the specified number of bytes.
 */
export function randomString(numBytes: number): string {
	return randomBytes(numBytes).toString("base64");
}

/**
 * Calculates the SHA-256 hash of the given string and returns it as a hex string.
 */
export function sha256(value: string): string {
	return createHash("sha256").update(value).digest("hex");
}

/**
 * Calculates the HMAC of the given value using the specified key and returns it as a hex string.
 */
export function hmac(key: string, value: string): string {
	return createHmac("sha256", key).update(value).digest("hex");
}
