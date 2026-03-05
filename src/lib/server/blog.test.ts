import { describe, expect, it } from "vitest";

import { Blog, SYNC_COOLDOWN_HOURS } from "./blog";
import { randomBlogParams } from "./test";

describe("blog", () => {
	describe("canBeSynced", () => {
		it("should prevent syncing more often than the desired cooldown", () => {
			const now = new Date();
			const syncCooldownMS = SYNC_COOLDOWN_HOURS * 60 * 60 * 1000;

			const blog = new Blog(randomBlogParams());

			const longBeforeSyncedAt = new Date(Date.now() - syncCooldownMS * 2);
			blog.syncedAt = longBeforeSyncedAt;
			expect(blog.canBeSynced(now)).toEqual(true);

			const recentBeforeSyncedAt = new Date(Date.now() - syncCooldownMS / 2);
			blog.syncedAt = recentBeforeSyncedAt;
			expect(blog.canBeSynced(now)).toEqual(false);

			const recentAfterSyncedAt = new Date(Date.now() + syncCooldownMS / 2);
			blog.syncedAt = recentAfterSyncedAt;
			expect(blog.canBeSynced(now)).toEqual(false);

			const longAfterSyncedAt = new Date(Date.now() + syncCooldownMS * 2);
			blog.syncedAt = longAfterSyncedAt;
			expect(blog.canBeSynced(now)).toEqual(false);
		});

		it("should prevent syncing if the feed is cached until a future date", () => {
			const now = new Date();

			const blog = new Blog(randomBlogParams());
			expect(blog.canBeSynced(now)).toEqual(true);

			// Make the blog cached until 1 hour in the future, which should prevent syncing.
			blog.cachedUntil = new Date(Date.now() + 1000 * 60 * 60);
			expect(blog.canBeSynced(now)).toEqual(false);

			// Make the blog cached until 1 hour in the past, which should allow syncing.
			blog.cachedUntil = new Date(Date.now() - 1000 * 60 * 60);
			expect(blog.canBeSynced(now)).toEqual(true);
		});
	});
});
