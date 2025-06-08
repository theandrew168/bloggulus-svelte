<script lang="ts">
	import { page } from "$app/state";
</script>

<section>
	<article>
		<p>{page.status}</p>
		<h2>{page.error?.message}</h2>
		<a href="/">Go back home</a>
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

	a {
		color: var(--color-white);
		background-color: var(--color-dark);
		text-decoration: none;
		padding: 0.5em 1em;
		border-radius: 0.25em;
		box-shadow: var(--shadow);
	}

	a:hover {
		background-color: var(--color-medium);
		cursor: pointer;
	}
</style>
