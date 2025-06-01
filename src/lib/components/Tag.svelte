<script lang="ts">
	interface Props {
		name: string;
	}

	let { name }: Props = $props();
</script>

<a href="?q={name}">{name}</a>

<style>
	a {
		color: var(--color-white);
		background-color: var(--color-dark);
		font-weight: 600;
		padding: 0.25em 0.75em;
		border-radius: 0.25em;
		text-decoration: none;
	}

	a:hover {
		background-color: var(--color-medium);
	}
</style>
