<script lang="ts">
	type Props = {
		message: string;
	};

	let { message }: Props = $props();
</script>

<section class="notification">
	<p>{message}</p>
</section>

<style>
	.notification {
		color: var(--color-white);
		background-color: var(--color-primary);
		padding: 1em 0;
		text-align: center;
	}
</style>
