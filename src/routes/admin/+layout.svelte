<script lang="ts">
	interface Props {
		children?: import("svelte").Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="container toolbar">
	<a href="/admin/blogs">Blogs</a>
	<a href="/admin/tags">Tags</a>
</div>
{@render children?.()}

<style>
	.toolbar {
		margin-top: 1rem;
		margin-bottom: 1rem;
		display: flex;
		gap: 1rem;
	}
</style>
