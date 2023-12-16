import prisma from "$lib/prisma";

export async function load() {
	const posts = await prisma.post.findMany({
		include: {
			blog: true,
		},
	});
	return {
		posts,
	};
}
