<script lang="ts">
	export let name: string;
</script>

<span>{name}</span>

<style>
	span {
		color: var(--light-color);
		background-color: var(--dark-color);
		font-weight: bold;
		padding: 0.25rem 0.75rem;
		border-radius: 0.25rem;
	}
</style>
