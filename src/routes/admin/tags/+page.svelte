<script lang="ts">
	import { enhance } from "$app/forms";

	let { data } = $props();
</script>

<div class="container">
	<h1>Tags</h1>
	<div class="add">
		<form method="POST" action="?/add" use:enhance>
			<input name="name" placeholder="Name" />
			<button type="submit">Add</button>
		</form>
	</div>
	<div class="tags">
		{#each data.tags as tag}
			<div class="tag">
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="id" value={tag.id} />
					<button type="submit">Delete</button>
				</form>
				<p>{tag.name}</p>
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
	.tags {
		margin-bottom: 1rem;
	}
	.tag {
		display: flex;
		gap: 1rem;
	}
</style>
