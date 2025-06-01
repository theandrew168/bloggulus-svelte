<script lang="ts">
	import { page } from "$app/state";

	import Article from "$lib/components/Article.svelte";

	let { data } = $props();

	let q = $derived(page.url.searchParams.get("q") ?? "");
	let p = $derived(parseInt(page.url.searchParams.get("p") ?? "1") || 1);
	let moreLink = $derived(`/?p=${p + 1}` + (q ? `&q=${q}` : ""));
</script>

<header class="articles-header">
	{#if q}
		<h1 class="articles-header__title">Relevant Articles</h1>
	{:else}
		<h1 class="articles-header__title">Recent Articles</h1>
	{/if}
	<search>
		<form method="GET" action="/">
			<input class="input" type="text" name="q" value={q} placeholder="Search" />
		</form>
	</search>
</header>

<div class="container">
	<div class="posts">
		{#each data.articles as article}
			<Article {article} />
		{/each}
	</div>
	{#if data.articles.length === 15}
		<div class="more">
			<a class="shadow" href={moreLink}>See More</a>
		</div>
	{/if}
</div>

<style>
	header {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 1.5em 1em;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	h1 {
		color: var(--color-dark);
		font-size: 24px;
		font-weight: 600;
	}

	.posts {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.more {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.more a {
		padding: 0.5rem 1.5rem;
		border-radius: 0.25rem;

		font-weight: 600;
		text-decoration: none;
		color: var(--dark-color);
		background-color: var(--light-color);
	}
</style>
