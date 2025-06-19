<script lang="ts">
	import { enhance } from "$app/forms";

	import bloggulusLogo from "$lib/assets/img/bloggulus.png";
	import githubLogo from "$lib/assets/img/github.png";
	import googleLogo from "$lib/assets/img/google.png";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<section>
	<article>
		<h2>Welcome!</h2>

		<hr />

		{#if data.enableDebugAuth}
			<form method="POST" action="/signin/debug" use:enhance>
				<button type="submit">
					<img src={bloggulusLogo} alt="Bloggulus logo" />
					Sign in with Debug
				</button>
			</form>
		{/if}

		<a href="/signin/github">
			<img src={githubLogo} alt="GitHub logo" />
			Sign in with GitHub
		</a>

		<a href="/signin/google">
			<img src={googleLogo} alt="Google logo" />
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

		width: 100%;
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
