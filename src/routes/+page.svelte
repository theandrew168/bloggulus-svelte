<script>
	export let data;
</script>

<div class="container">
	<div class="recent">Recent Posts</div>
	<div class="posts">
		{#each data.posts as post}
			<div class="post shadow">
				<div>{post.updatedAt}</div>
				<div><a href={post.url}>{post.title}</a></div>
				<div>{post.blog.title}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.recent {
		font-size: 24px;
		font-weight: 500;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}

	.post {
		background-color: white;
		text-align: left;
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}
</style>
