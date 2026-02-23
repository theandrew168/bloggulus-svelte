<script lang="ts">
	import { page } from "$app/state";

	import Button from "$lib/components/Button.svelte";
</script>

<section>
	<article>
		<p>{page.status}</p>
		<h2>{page.error?.message}</h2>
		<Button kind="link" href="/">Go back home</Button>
	</article>
</section>

<style>
	section {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	p {
		font-weight: 500;
		color: var(--color-medium);
		margin-bottom: 1em;
	}

	h2 {
		margin-bottom: 2.5em;
	}
</style>
