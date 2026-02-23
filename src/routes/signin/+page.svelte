<script lang="ts">
	import { enhance } from "$app/forms";

	import bloggulusLogo from "$lib/assets/img/bloggulus.png";
	import githubLogo from "$lib/assets/img/github.png";
	import googleLogo from "$lib/assets/img/google.png";
	import Button from "$lib/components/Button.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<section class="page">
	<article class="card">
		<h2 class="title">Welcome!</h2>

		<hr />

		{#if data.enableDebugAuth}
			<form method="POST" action="/signin/debug" use:enhance>
				<Button kind="button" type="submit" isOutline isFullWidth>
					<div class="button-content">
						<img class="button-logo" src={bloggulusLogo} alt="Bloggulus logo" />
						Sign in with Debug
					</div>
				</Button>
			</form>
		{/if}

		<Button kind="link" href="/signin/github" isOutline isFullWidth>
			<div class="button-content">
				<img class="button-logo" src={githubLogo} alt="GitHub logo" />
				Sign in with GitHub
			</div>
		</Button>

		<Button kind="link" href="/signin/google" isOutline isFullWidth>
			<div class="button-content">
				<img class="button-logo" src={googleLogo} alt="Google logo" />
				Sign in with Google
			</div>
		</Button>
	</article>
</section>

<style>
	.page {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card {
		background-color: var(--color-white);
		padding: 2em;
		box-shadow: var(--shadow-md);
		border-radius: 0.5em;
		display: flex;
		flex-direction: column;
		gap: 1.5em;
	}

	.title {
		text-align: center;
		font-weight: 500;
	}

	.button-content {
		font-size: 1rem;
		font-weight: 500;
		padding: 0.25em;
		display: flex;
		align-items: center;
		gap: 1em;
	}

	.button-logo {
		width: 1.5em;
		height: 1.5em;
	}
</style>
