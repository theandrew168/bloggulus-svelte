<script lang="ts">
	import { enhance } from "$app/forms";

	let { data } = $props();

	const body = data.post.body ?? "<empty>";
</script>

<div class="container">
	<h1>{data.post?.title}</h1>
	<div class="links">
		<a href={data.post.url}>(URL)</a>
		<a href="/admin/blogs/{data.post.blogId}">(Blog)</a>
	</div>
	<div class="times">
		<h2>Updated</h2>
		<div>{data.post.updatedAt.toLocaleString()}</div>
	</div>
	<div class="actions">
		<h2>Actions</h2>
		<div class="buttons">
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={data.post.id} />
				<button type="submit">Delete</button>
			</form>
		</div>
	</div>
	<div class="tags">
		<h2>{data.post.tags.length} Tag(s)</h2>
		{#each data.post.tags ?? [] as tag}
			<div>{tag}</div>
		{/each}
	</div>
	<div class="body">
		<h2>Body</h2>
		<div>{body}</div>
	</div>
</div>

<style>
	h1 {
		font-size: 1.5rem;
		font-weight: 500;
	}
	h2 {
		font-size: 1.5rem;
	}
	.links {
		margin-bottom: 1rem;
	}
	.times {
		margin-bottom: 1rem;
	}
	.actions {
		margin-bottom: 1rem;
	}
	.buttons {
		display: flex;
		gap: 0.5rem;
	}
	.tags {
		margin-bottom: 1rem;
	}
	.body {
		margin-bottom: 1rem;
	}
</style>
