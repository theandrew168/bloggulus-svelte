import { createHash, createHmac, randomBytes, type UUID } from "node:crypto";

// TODO: Find a better place for these.

export function isValidUUID(s: string): s is UUID {
	const pattern = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
	return pattern.test(s);
}

export function randomString(numBytes: number): string {
	return randomBytes(numBytes).toString("base64url");
}

export function sha256(value: string): string {
	return createHash("sha256").update(value).digest("hex");
}

export function hmac(key: string, value: string): string {
	return createHmac("sha256", key).update(value).digest("hex");
}
