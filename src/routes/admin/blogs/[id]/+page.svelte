<script lang="ts">
	import { enhance } from "$app/forms";

	export let data;
</script>

<div class="container">
	<h1>{data.blog?.title}</h1>
	<div class="links">
		<a href={data.blog.siteUrl}>(Site URL)</a>
		<a href={data.blog.feedUrl}>(Feed URL)</a>
	</div>
	<div class="times">
		<h2>Synced</h2>
		<div>{data.blog.syncedAt.toLocaleString()}</div>
	</div>

	<div class="posts">
		<h2>{data.posts.length} Posts</h2>
		{#each data.posts as post}
			<div class="post">
				<a href="/admin/posts/{post.id}">{post.title}</a>
				<span>{post.updatedAt.toDateString()}</span>
			</div>
		{/each}
	</div>

	<div class="actions">
		<h2>Actions</h2>
		<div class="buttons">
			<form method="POST" action="?/sync" use:enhance>
				<input type="hidden" name="id" value={data.blog.id} />
				<button type="submit">Sync</button>
			</form>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={data.blog.id} />
				<button type="submit">Delete</button>
			</form>
		</div>
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
	.posts {
		margin-bottom: 1rem;
	}
	.post {
		display: flex;
		justify-content: space-between;
	}
	.actions {
		margin-bottom: 1rem;
	}
	.buttons {
		display: flex;
		gap: 0.5rem;
	}
</style>
