<script lang="ts">
	import { enhance } from "$app/forms";

	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";
	import Link from "$lib/components/Link.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<section>
	<article class="links">
		<h1>{data.blog.title}</h1>
		<ul>
			<li><Link kind="link" href={data.blog.siteURL.href}>(Site URL)</Link></li>
			<li><Link kind="link" href={data.blog.feedURL.href}>(Feed URL)</Link></li>
		</ul>
	</article>
	<article class="synced">
		<h2>Synced at:</h2>
		<time datetime={data.blog.syncedAt.toISOString()}>{data.blog.syncedAt.toLocaleString()}</time>
	</article>
	<article class="visibility">
		<h2>Visibility:</h2>
		{#if data.blog.isPublic}
			<span>Public</span>
		{:else}
			<span>Private</span>
		{/if}
	</article>
	<article class="actions">
		<h2>Actions</h2>
		<ul>
			<li>
				<form method="POST" action="?/delete" use:enhance>
					<Input type="hidden" name="blogID" value={data.blog.id} />
					<Button kind="button" type="submit">Delete</Button>
				</form>
			</li>
			{#if data.blog.isPublic}
				<li>
					<form method="POST" action="?/hide" use:enhance>
						<Input type="hidden" name="blogID" value={data.blog.id} />
						<Button kind="button" type="submit">Hide</Button>
					</form>
				</li>
			{:else}
				<li>
					<form method="POST" action="?/show" use:enhance>
						<Input type="hidden" name="blogID" value={data.blog.id} />
						<Button kind="button" type="submit">Show</Button>
					</form>
				</li>
			{/if}
		</ul>
	</article>
	<article class="posts">
		<h2>{data.posts.length} Posts</h2>
		<ul>
			{#each data.posts as post (post.id)}
				<li>
					<Link kind="link" href={`/blogs/${post.blogID}/posts/${post.id}`}>{post.title}</Link>
					<time datetime={post.publishedAt.toISOString()}>{post.publishedAt.toDateString()}</time>
				</li>
			{/each}
		</ul>
	</article>
</section>

<style>
	section {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 1em;
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	.links h1 {
		font-size: 2rem;
		margin-bottom: 0.5em;
	}

	.links ul {
		display: flex;
		gap: 0.5em;
	}

	.synced h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5em;
	}

	.visibility h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5em;
	}

	.actions h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5em;
	}

	.actions ul {
		display: flex;
		gap: 0.5em;
	}

	.posts h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5em;
	}

	.posts ul {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.posts li {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
