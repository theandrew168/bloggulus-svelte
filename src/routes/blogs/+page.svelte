<script lang="ts">
	import { enhance } from "$app/forms";

	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";
	import Link from "$lib/components/Link.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<section class="page">
	<header class="header">
		<h1 class="title">Blogs</h1>
		<form method="POST" action="?/add" use:enhance>
			<span class="follow-input">
				<Input type="text" name="feedURL" placeholder="Follow RSS Feed" />
			</span>
			<Button kind="button" type="submit">Follow</Button>
		</form>
	</header>
	<ul class="list">
		{#each data.blogs as blog (blog.id)}
			<li class="blog">
				{#if data.account?.isAdmin}
					<Link kind="link" href={`/blogs/${blog.id}`}>{blog.title}</Link>
				{:else}
					<Link kind="link" href={blog.siteURL.href}>{blog.title}</Link>
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
			<article class="message">
				<p>Follow your favorite blogs by adding their RSS feed above!</p>
			</article>
		{/each}
	</ul>
</section>

<style>
	.page {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 1em;
	}

	.header {
		margin-bottom: 1em;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5em;
	}

	.follow-input {
		display: inline-block;
		width: 50%;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.blog {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.message {
		margin-top: 4em;
		text-align: center;
	}
</style>
