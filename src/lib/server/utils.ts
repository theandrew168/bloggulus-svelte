import type { UUID } from "$lib/types";

// TODO: Find a better place for these.

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
function bufferToHex(buffer: ArrayBuffer): string {
	const view = new Uint8Array(buffer);
	return Array.from(view)
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

export function isValidUUID(s: string): s is UUID {
	const pattern = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
	return pattern.test(s);
}

/**
 * Generates a random base64-encoded string of the specified number of bytes.
 */
export function randomString(numBytes: number): string {
	const buffer = new Uint8Array(numBytes);
	crypto.getRandomValues(buffer);
	return btoa(String.fromCharCode(...buffer));
}

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#basic_example
export async function sha256(value: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(value);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return bufferToHex(hash);
}

export async function hmac(key: string, value: string): Promise<string> {
	const encoder = new TextEncoder();
	const encodedKey = encoder.encode(key);
	const encodedValue = encoder.encode(value);

	// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey
	const hmacKey = await crypto.subtle.importKey(
		"raw",
		encodedKey,
		{
			name: "HMAC",
			hash: "SHA-256",
		},
		true,
		["sign", "verify"],
	);

	// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign#hmac_2
	const signature = await crypto.subtle.sign("HMAC", hmacKey, encodedValue);
	return bufferToHex(signature);
}

export function sessionCookieOptions() {
	return {
		path: "/",
		secure: true,
		httpOnly: true,
		sameSite: "lax",
	} as const;
}

export function permanentCookieOptions(maxAge: number) {
	return {
		...sessionCookieOptions(),
		maxAge,
	};
}
