import { Prisma, PrismaClient } from "@prisma/client";

const postWithBlog = Prisma.validator<Prisma.PostDefaultArgs>()({
	include: {
		blog: true,
	},
});
export type PostWithBlog = Prisma.PostGetPayload<typeof postWithBlog>;

// const prisma = new PrismaClient({ log: ['query'] });
const prisma = new PrismaClient();

export default prisma;
