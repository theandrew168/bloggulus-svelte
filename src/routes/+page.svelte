<script lang="ts">
	import { page } from "$app/stores";
	import Post from "$lib/components/Post.svelte";

	export let data;

	$: p = parseInt($page.url.searchParams.get("p") ?? "1") || 1;
</script>

<div class="container">
	<h1>Recent Posts</h1>
	<div class="posts">
		{#each data.posts as post}
			<Post
				title={post.title}
				url={post.url}
				updatedAt={post.updatedAt}
				blogTitle={post.blog.title}
				blogURL={post.blog.siteURL}
			/>
		{/each}
	</div>
	<div class="more">
		<a class="shadow" href="/?p={p + 1}">See More</a>
	</div>
</div>

<style>
	h1 {
		color: var(--dark-color);
		font-size: 24px;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.posts {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.more {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.more a {
		padding: 0.5rem 1.5rem;
		border-radius: 0.25rem;

		font-weight: 600;
		text-decoration: none;
		color: var(--dark-color);
		background-color: var(--light-color);
	}
</style>
