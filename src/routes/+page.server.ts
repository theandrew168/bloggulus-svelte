import type { LoadEvent } from "@sveltejs/kit";

import prisma from "$lib/server/prisma";

const PAGE_SIZE = 15;

export async function load({ url }: LoadEvent) {
	const q = url.searchParams.get("q") ?? "";
	const p = parseInt(url.searchParams.get("p") ?? "1") || 1;
	const skip = (p - 1) * PAGE_SIZE;
	const take = PAGE_SIZE;

	const posts = await prisma.post.findMany({
		where: {
			...(q
				? {
						title: {
							contains: q,
							mode: 'insensitive',
						},
					}
				: {}),
		},
		include: {
			blog: true,
		},
		orderBy: [{ updatedAt: "desc" }],
		skip,
		take,
	});
	return {
		posts,
	};
}
