<script lang="ts">
	import { enhance } from "$app/forms";

	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<section>
	<header>
		<h1>Blogs</h1>
		<form method="POST" action="?/add" use:enhance>
			<span>
				<Input type="text" name="feedURL" placeholder="Follow RSS Feed" />
			</span>
			<Button kind="button" type="submit">Follow</Button>
		</form>
	</header>
	<ul>
		{#each data.blogs as blog (blog.id)}
			<li>
				{#if data.account?.isAdmin}
					<a href="/blogs/{blog.id}">{blog.title}</a>
				{:else}
					<a href={blog.siteURL.href}>{blog.title}</a>
				{/if}

				{#if blog.isFollowed}
					<form method="POST" action="?/unfollow" use:enhance>
						<Input type="hidden" name="blogID" value={blog.id} />
						<Button kind="button" type="submit" isOutline>Unfollow</Button>
					</form>
				{:else}
					<form method="POST" action="?/follow" use:enhance>
						<Input type="hidden" name="blogID" value={blog.id} />
						<Button kind="button" type="submit">Follow</Button>
					</form>
				{/if}
			</li>
		{:else}
			<article>
				<p>Follow your favorite blogs by adding their RSS feed above!</p>
			</article>
		{/each}
	</ul>
</section>

<style>
	section {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 1em;
	}

	header {
		margin-bottom: 1em;
	}

	h1 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5em;
	}

	/* TODO: Is there a better way to control input widths? */
	span {
		display: inline-block;
		width: 50%;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	a {
		color: var(--color-dark);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	article {
		margin-top: 4em;
		text-align: center;
	}
</style>
