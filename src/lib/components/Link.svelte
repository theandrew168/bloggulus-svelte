<script lang="ts">
	import type { Snippet } from "svelte";

	type LinkProps = {
		kind: "link";
		href: string;
		children: Snippet;
	};

	type ButtonProps = {
		kind: "button";
		type: "submit";
		children: Snippet;
	};

	type Props = LinkProps | ButtonProps;

	let props: Props = $props();
</script>

{#if props.kind === "link"}
	<a class="link" href={props.href}>
		{@render props.children()}
	</a>
{:else if props.kind === "button"}
	<button class="link" type={props.type}>
		{@render props.children()}
	</button>
{/if}

<style>
	.link {
		color: inherit;
		font-size: inherit;
		text-decoration: none;
		cursor: pointer;
		/* Make buttons look like links, if necessary (like for the logout form). */
		background: none;
		border: none;
		padding: 0;
	}

	.link:hover {
		text-decoration: underline;
	}
</style>
