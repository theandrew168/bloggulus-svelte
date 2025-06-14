<script lang="ts">
	import { page } from "$app/state";

	import Article from "$lib/components/Article.svelte";
	import Input from "$lib/components/Input.svelte";
	import LinkButton from "$lib/components/LinkButton.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	let q = $derived(page.url.searchParams.get("q") ?? "");
	let p = $derived(parseInt(page.url.searchParams.get("p") ?? "1") || 1);
	let moreLink = $derived(`/?p=${p + 1}` + (q ? `&q=${q}` : ""));
</script>

<header>
	{#if q}
		<h1>Relevant Articles</h1>
	{:else}
		<h1>Recent Articles</h1>
	{/if}
	<search>
		<form method="GET" action="/">
			<Input type="text" name="q" value={q} placeholder="Search" />
		</form>
	</search>
</header>

<section>
	{#each data.articles as article}
		<Article {article} />
	{/each}
	<!-- TODO: Add empty state w/ "Add Blog" CTA. -->
</section>

<footer>
	<LinkButton href={moreLink} isOutline>See More</LinkButton>
</footer>

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

	section {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 0 1em;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1.5em 0.5em;
	}
</style>
