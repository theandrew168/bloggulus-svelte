<script lang="ts">
	import { enhance } from "$app/forms";

	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<section>
	<article class="links">
		<h1>{data.blog.title}</h1>
		<ul>
			<li><a href={data.blog.siteURL}>(Site URL)</a></li>
			<li><a href={data.blog.feedURL}>(Feed URL)</a></li>
		</ul>
	</article>
	<article class="synced">
		<h2>Synced at:</h2>
		<time datetime={data.blog.syncedAt.toISOString()}>{data.blog.syncedAt.toLocaleString()}</time>
	</article>
	<article class="actions">
		<h2>Actions</h2>
		<form method="POST" use:enhance>
			<Input type="hidden" name="blogID" value={data.blog.id} />
			<Button>Delete</Button>
		</form>
	</article>
	<article class="posts">
		<h2>{data.posts.length} Posts</h2>
		<ul>
			{#each data.posts as post (post.id)}
				<li>
					<a href="/blogs/{post.blogID}/posts/{post.id}">{post.title}</a>
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

	.links a {
		color: var(--color-dark);
		text-decoration: none;
	}

	.links a:hover {
		cursor: pointer;
		text-decoration: underline;
	}

	.synced h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5em;
	}

	.actions h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5em;
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

	.posts a {
		color: var(--color-dark);
		text-decoration: none;
	}

	.posts a:hover {
		cursor: pointer;
		text-decoration: underline;
	}
</style>
