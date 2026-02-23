<script lang="ts">
	import { page } from "$app/state";

	import Article from "$lib/components/app/Article.svelte";
	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	let q = $derived(page.url.searchParams.get("q") ?? "");
</script>

<header class="header">
	{#if q}
		<h1 class="title">Relevant Articles</h1>
	{:else}
		<h1 class="title">Recent Articles</h1>
	{/if}
	<search>
		<form method="GET" action="/">
			<Input type="text" name="q" value={q} placeholder="Search" />
		</form>
	</search>
</header>

<section class="articles">
	{#each data.articles as article (article.url)}
		<Article {article} />
	{:else}
		{#if q}
			<article class="message">
				<p>No relevant articles! Try searching for something else.</p>
			</article>
		{:else}
			<article class="message">
				<p>No posts found! Get started by following your favorite blogs.</p>
				<p>
					<Button kind="link" href="/blogs">Follow Blogs</Button>
				</p>
			</article>
		{/if}
	{/each}
</section>

<footer class="footer">
	{#if data.moreLink}
		<Button kind="link" href={data.moreLink} isOutline>View More Articles</Button>
	{/if}
</footer>

<style>
	.header {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 1.5em 1em;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 600;
	}

	.articles {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 0 1em;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.message {
		margin-top: 4em;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2em;
	}

	.footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1.5em 0.5em;
	}
</style>
