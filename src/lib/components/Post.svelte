<script lang="ts">
	import type { PostWithBlogAndTags } from "$lib/types";

	import Tag from "./Tag.svelte";

	interface Props {
		post: PostWithBlogAndTags;
	}

	let { post }: Props = $props();
</script>

<div class="post shadow">
	<div class="top">
		<div class="updated">{post.updatedAt.toDateString()}</div>
		{#each post.tags.slice(0, 3) as tag}
			<Tag name={tag} />
		{/each}
	</div>
	<div class="title">
		<a href={post.url}>{post.title}</a>
	</div>
	<div class="blogTitle">
		<a href={post.blogUrl}>{post.blogTitle}</a>
	</div>
</div>

<style>
	.post {
		background-color: var(--light-color);
		text-align: left;
		padding: 1.5rem;
		border-radius: 0.5rem;
	}
	.top {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.updated {
		color: var(--mid-color);
		font-size: 0.875rem;
		font-weight: 300;
		margin-right: auto;
	}
	.title {
		margin-bottom: 0.5rem;
	}
	.title a {
		color: var(--dark-color);
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 2rem;
		text-decoration: none;
	}
	.title:hover {
		text-decoration: underline;
	}
	.blogTitle a {
		color: var(--dark-color);
		font-weight: 600;
		text-decoration: none;
	}
	.blogTitle:hover {
		text-decoration: underline;
	}
</style>
