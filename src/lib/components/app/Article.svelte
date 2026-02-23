<script lang="ts">
	import Link from "$lib/components/Link.svelte";
	import type { Article } from "$lib/types";

	import Tag from "./Tag.svelte";

	type Props = {
		article: Article;
	};

	let { article }: Props = $props();
</script>

<article class="article">
	<header class="header">
		<span class="publishedAt">{article.publishedAt.toDateString()}</span>
		<ul class="tags">
			{#each article.tags as tag}
				<li><Tag name={tag} /></li>
			{/each}
		</ul>
	</header>
	<p class="title"><Link kind="link" href={article.url.href}>{article.title}</Link></p>
	<p class="blogTitle"><Link kind="link" href={article.blogURL.href}>{article.blogTitle}</Link></p>
</article>

<style>
	.article {
		box-shadow: var(--shadow-md);
		background-color: var(--color-white);
		text-align: left;
		padding: 1.5em;
		border-radius: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5em;
	}

	.publishedAt {
		color: var(--color-gray-500);
		font-size: 0.875rem;
		font-weight: 300;
	}

	.tags {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.blogTitle {
		font-weight: 600;
	}
</style>
