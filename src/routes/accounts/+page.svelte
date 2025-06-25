<script lang="ts">
	import { enhance } from "$app/forms";

	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<section>
	<header>
		<h1>Accounts</h1>
	</header>
	<ul>
		{#each data.accounts as account (account.id)}
			<li>
				<p>{account.username}</p>

				<form method="POST" use:enhance>
					<Input type="hidden" name="accountID" value={account.id} />
					<Button isOutline>Delete</Button>
				</form>
			</li>
		{/each}
	</ul>
</section>

<style>
	section {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 1em;
	}

	header {
		margin-bottom: 1em;
	}

	h1 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5em;
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
