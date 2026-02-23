<script lang="ts">
	import type { Snippet } from "svelte";

	type ButtonProps = {
		kind: "button";
		type: "submit";
		isOutline?: boolean;
		children: Snippet;
	};

	type LinkProps = {
		kind: "link";
		href: string;
		isOutline?: boolean;
		children: Snippet;
	};

	type Props = ButtonProps | LinkProps;

	let { isOutline, children, ...props }: Props = $props();
</script>

{#if props.kind === "button"}
	<button class={{ button: true, outline: isOutline }} type={props.type}>
		{@render children()}
	</button>
{:else if props.kind === "link"}
	<a class={{ button: true, outline: isOutline }} href={props.href}>
		{@render children()}
	</a>
{/if}

<style>
	.button {
		color: var(--color-white);
		background-color: var(--color-dark);
		padding: 0.75em 1em;
		font-weight: 600;
		border-radius: 0.5em;
		border-width: 0;
		text-decoration: none;
	}

	.button:hover {
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
