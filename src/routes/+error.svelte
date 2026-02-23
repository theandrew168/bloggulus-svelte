<script lang="ts">
	import { page } from "$app/state";

	import Button from "$lib/components/Button.svelte";
</script>

<section class="page">
	<article>
		<p class="status">{page.status}</p>
		<h2 class="message">{page.error?.message}</h2>
		<Button kind="link" href="/">Go back home</Button>
	</article>
</section>

<style>
	.page {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.status {
		font-size: 1.5rem;
		font-weight: 500;
		color: var(--color-gray-500);
		margin-bottom: 0.75em;
	}

	.message {
		margin-bottom: 2.5em;
	}
</style>
