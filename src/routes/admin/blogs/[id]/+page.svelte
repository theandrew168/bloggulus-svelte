<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

<div class="container">
	<h1>{data.blog?.title}</h1>
	<div class="links">
		<a href={data.blog?.siteUrl}>(Site URL)</a>
		<a href={data.blog?.feedUrl}>(Feed URL)</a>
	</div>
	<div class="times">
		<h2>Synced at:</h2>
		<div>{data.blog?.syncedAt.toLocaleString()}</div>
	</div>

	<div class="posts">
		<h2>{data.posts.length} Posts</h2>
		{#each data.posts as post}
			<div class="post">
				<a href={post.url}>{post.title}</a>
				<span>{post.updatedAt.toDateString()}</span>
			</div>
		{/each}
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
</style>
