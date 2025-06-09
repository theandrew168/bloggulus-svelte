<script lang="ts">
	let { data } = $props();
</script>

<section>
	<article>
		<h2>Welcome!</h2>

		<hr />

		{#if data.isDevelopment}
			<form method="POST" action="/signin/debug">
				<button type="submit">
					<img src="/img/bloggulus.png" alt="Bloggulus logo" />
					Sign in with Debug
				</button>
			</form>
		{/if}

		<a href="/signin/github">
			<img src="/img/github.png" alt="GitHub logo" />
			Sign in with GitHub
		</a>

		<a href="/signin/google">
			<img src="/img/google.png" alt="Google logo" />
			Sign in with Google
		</a>
	</article>
</section>

<style>
	section {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	article {
		background-color: var(--color-white);
		padding: 2em;
		box-shadow: var(--shadow);
		border-radius: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 1.5em;
	}

	h2 {
		text-align: center;
		font-weight: 500;
	}

	a,
	button {
		color: var(--color-dark);
		background-color: var(--color-white);
		font-size: 1rem;
		font-weight: 500;

		padding: 1em;
		text-decoration: none;
		border: 1px solid var(--color-dark);
		border-radius: 0.5em;

		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	a:hover,
	button:hover {
		background-color: var(--color-gray);
		cursor: pointer;
	}

	img {
		max-width: 24px;
		max-height: 24px;
	}
</style>
