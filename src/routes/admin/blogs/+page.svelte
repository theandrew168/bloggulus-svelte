<script lang="ts">
	import { enhance } from "$app/forms";

	export let data;
</script>

<div class="container">
	<h1>Blogs</h1>
	<div class="add">
		<form method="POST" action="?/add" use:enhance>
			<input name="url" placeholder="RSS / Atom Feed URL" />
			<button type="submit">Add</button>
		</form>
	</div>
	<div class="blogs">
		{#each data.blogs as blog}
			<div class="blog">
				<a href="/admin/blogs/{blog.id}">{blog.title}</a>
				<form method="POST" action="?/sync" use:enhance>
					<input type="hidden" name="id" value={blog.id} />
					<button type="submit">Sync</button>
				</form>
			</div>
		{/each}
	</div>
</div>

<style>
	h1 {
		font-size: 24px;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}
	.add {
		margin-bottom: 1rem;
	}
	.blogs {
		margin-bottom: 1rem;
	}
	.blog {
		display: flex;
		justify-content: space-between;
	}
</style>
