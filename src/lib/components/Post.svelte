<script lang="ts">
	import Tag from "./Tag.svelte";

	export let title: string;
	export let url: string;
	export let updatedAt: Date;
	export let blogTitle: string;
	export let blogURL: string;
</script>

<div class="post shadow">
	<div class="top">
		<div class="updated">{updatedAt.toDateString()}</div>
		<Tag name="Tag" />
		<Tag name="Python" />
		<Tag name="wow" />
	</div>
	<div class="title">
		<a href={url}>{title}</a>
	</div>
	<div class="blogTitle">
		<a href={blogURL}>{blogTitle}</a>
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
		font-weight: bold;
		line-height: 2rem;
		text-decoration: none;
	}
	.title:hover {
		text-decoration: underline;
	}
	.blogTitle a {
		color: var(--dark-color);
		font-weight: bold;
		text-decoration: none;
	}
	.blogTitle:hover {
		text-decoration: underline;
	}
</style>
