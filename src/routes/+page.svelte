<script>
	import "$lib/styles/reset.css";
	import "$lib/styles/fonts.css";
	import "$lib/styles/style.css";

	export let data;
</script>

<div class="sans-serif">
	<nav class="nav shadow">
		<div class="container">
			<div class="nav-items">
				<a href="/">Bloggulus</a>
				<input />
			</div>
		</div>
	</nav>
	<div class="container recent">Recent Posts</div>
	<div class="container posts">
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
	.nav {
		background-color: white;
		padding: 1rem 0;
		margin-bottom: 1rem;
	}
	.nav-items {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

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
