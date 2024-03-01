import type { Storage } from "$lib/server/storage/storage";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			storage: Storage;
		}
	}
}

export {};
