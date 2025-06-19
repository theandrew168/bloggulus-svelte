<script lang="ts">
	type Props = {
		message: string;
	};

	let { message }: Props = $props();
</script>

<section>
	<p>{message}</p>
</section>

<style>
	section {
		background-color: var(--color-dark);
		color: var(--color-white);
		padding: 1em;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
</style>
