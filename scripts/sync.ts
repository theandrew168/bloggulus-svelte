import { PrismaClient } from "@prisma/client";
import Parser from "rss-parser";

const prisma = new PrismaClient();

async function main() {
	console.log(`Starting sync...`);

	const feedURL = "https://shallowbrooksoftware.com/posts/index.xml";
	let blog = await prisma.blog.findUnique({
		where: {
			feedURL,
		},
	});

	const headers = new Headers();
	if (blog?.etag) {
		headers.set("If-None-Match", blog.etag);
	}
	if (blog?.lastModified) {
		headers.set("If-Modified-Since", blog.lastModified);
	}
	const resp = await fetch(feedURL, { headers });
	const text = await resp.text();

	const etag = resp.headers.get("ETag") ?? undefined;
	const lastModified = resp.headers.get("Last-Modified") ?? undefined;

	if (blog) {
		await prisma.blog.update({
			data: {
				etag,
				lastModified,
			},
			where: {
				feedURL,
			},
		});
	}

	if (resp.status >= 300) {
		console.log("No changes!");
		return;
	}

	const parser = new Parser();
	const feed = await parser.parseString(text);
	const siteURL = feed.link ?? feedURL;
	const title = feed.title ?? siteURL;

	if (!blog) {
		blog = await prisma.blog.create({
			data: {
				feedURL,
				siteURL,
				title,
				etag,
				lastModified,
			},
		});
	}

	for (const item of feed.items) {
		const url = item.link ?? "";
		const title = item.title ?? "";
		const updatedAt = item.pubDate ? new Date(item.pubDate) : new Date();

		let post = await prisma.post.findUnique({
			where: {
				url,
			},
		});
		if (!post) {
			post = await prisma.post.create({
				data: {
					url,
					title,
					updatedAt,
					blogID: blog.id,
				},
			});
		}
	}

	console.log(`Sync finished.`);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
