import prisma from "$lib/server/prisma";

export async function load() {
	const posts = await prisma.post.findMany({
		include: {
			blog: true,
		},
		orderBy: [{ updatedAt: "desc" }],
	});
	return {
		posts,
	};
}
