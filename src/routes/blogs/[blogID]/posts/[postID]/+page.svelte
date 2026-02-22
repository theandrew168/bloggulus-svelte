<script lang="ts">
	import { enhance } from "$app/forms";

	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<section>
	<article class="links">
		<h1>{data.post.title}</h1>
		<ul>
			<li><a href={data.post.url.href}>(URL)</a></li>
			<li><a href={`/blogs/${data.post.blogID}`}>(Blog)</a></li>
		</ul>
	</article>
	<article class="published">
		<h2>Published at:</h2>
		<time datetime={data.post.publishedAt.toISOString()}>{data.post.publishedAt.toLocaleString()}</time>
	</article>
	<article class="actions">
		<h2>Actions</h2>
		<form method="POST" use:enhance>
			<Input type="hidden" name="postID" value={data.post.id} />
			<Button>Delete</Button>
		</form>
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

	.published h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5em;
	}

	.actions h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5em;
	}
</style>
