<script lang="ts">
	import type { Snippet } from "svelte";

	type Props = {
		href: string;
		isOutline?: boolean;
		children: Snippet;
	};

	let { href, isOutline, children }: Props = $props();
</script>

<a class={{ outline: isOutline }} {href}>
	{@render children()}
</a>

<style>
	a {
		color: var(--color-white);
		background-color: var(--color-dark);
		padding: 0.75em 1em;
		font-weight: 600;
		border-radius: 0.5em;
		border-width: 0;
		text-decoration: none;
	}

	a:hover {
		background-color: var(--color-medium);
		cursor: pointer;
	}

	.outline {
		color: var(--color-dark);
		background-color: var(--color-white);
		box-shadow: var(--shadow);
	}

	.outline:hover {
		background-color: var(--color-gray);
	}
</style>
