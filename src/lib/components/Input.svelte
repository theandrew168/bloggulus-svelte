<script lang="ts">
	import type { HTMLInputTypeAttribute } from "svelte/elements";

	type Props = {
		type: HTMLInputTypeAttribute;
		name: string;
		value?: string;
		placeholder?: string;
	};

	let { type, name, value, placeholder }: Props = $props();
</script>

<input {type} {name} {value} {placeholder} />

<style>
	input {
		width: 100%;
		border: none;
		box-shadow: inset 0px 0px 0px 1px var(--color-light);
		border-radius: 0.375em;
		padding: 0.75em 1em;
	}
</style>
