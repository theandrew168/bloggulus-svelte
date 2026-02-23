<script lang="ts">
	type Props = {
		name: string;
	};

	let { name }: Props = $props();
</script>

<a href="?q={name}">{name}</a>

<style>
	a {
		color: var(--color-white);
		background-color: var(--color-primary);
		font-weight: 600;
		padding: 0.25em 0.75em;
		border-radius: 0.25em;
		text-decoration: none;

		transition: opacity 0.2s ease;
	}

	a:hover {
		opacity: 0.8;
	}
</style>
