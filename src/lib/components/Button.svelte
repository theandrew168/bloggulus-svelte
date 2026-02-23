<script lang="ts">
	import type { Snippet } from "svelte";

	type ButtonProps = {
		kind: "button";
		type: "submit";
		isOutline?: boolean;
		isFullWidth?: boolean;
		children: Snippet;
	};

	type LinkProps = {
		kind: "link";
		href: string;
		isOutline?: boolean;
		isFullWidth?: boolean;
		children: Snippet;
	};

	type Props = ButtonProps | LinkProps;

	let props: Props = $props();
</script>

{#if props.kind === "button"}
	<button class={{ button: true, outline: props.isOutline, fullWidth: props.isFullWidth }} type={props.type}>
		{@render props.children()}
	</button>
{:else if props.kind === "link"}
	<a class={{ button: true, outline: props.isOutline, fullWidth: props.isFullWidth }} href={props.href}>
		{@render props.children()}
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
		cursor: pointer;
	}

	.button:hover {
		background-color: var(--color-medium);
	}

	.outline {
		color: var(--color-dark);
		background-color: var(--color-white);
		box-shadow: var(--shadow);
	}

	.outline:hover {
		background-color: var(--color-gray);
	}

	.fullWidth {
		width: 100%;
	}
</style>
