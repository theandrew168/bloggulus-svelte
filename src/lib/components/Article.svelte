<script lang="ts">
	import type { Article } from "$lib/server/domain/query";

	import Tag from "./Tag.svelte";

	interface Props {
		article: Article;
	}

	let { article }: Props = $props();
</script>

<article>
	<header>
		<span class="publishedAt">{article.publishedAt.toDateString()}</span>
		<ul>
			{#each article.tags as tag}
				<li><Tag name={tag} /></li>
			{/each}
		</ul>
	</header>
	<p><a class="title" href={article.url}>{article.title}</a></p>
	<p><a class="blogTitle" href={article.blogURL}>{article.blogTitle}</a></p>
</article>

<style>
	article {
		box-shadow: var(--shadow);
		background-color: var(--color-white);
		text-align: left;
		padding: 1.5em;
		border-radius: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5em;
	}

	.publishedAt {
		color: var(--color-medium);
		font-size: 0.875rem;
		font-weight: 300;
	}

	ul {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.title {
		color: var(--color-dark);
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.2;
		text-decoration: none;
	}

	.title:hover {
		text-decoration: underline;
	}

	.blogTitle {
		color: var(--color-dark);
		font-weight: 600;
		text-decoration: none;
	}

	.blogTitle:hover {
		text-decoration: underline;
	}
</style>
