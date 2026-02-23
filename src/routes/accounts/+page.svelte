<script lang="ts">
	import { enhance } from "$app/forms";

	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<section class="page">
	<header class="header">
		<h1 class="title">Accounts</h1>
	</header>
	<ul class="list">
		{#each data.accounts as account (account.id)}
			<li class="account">
				<p>{account.username}</p>

				<form method="POST" use:enhance>
					<Input type="hidden" name="accountID" value={account.id} />
					<Button kind="button" type="submit" isOutline>Delete</Button>
				</form>
			</li>
		{/each}
	</ul>
</section>

<style>
	.page {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 1em;
	}

	.header {
		margin-bottom: 1em;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5em;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.account {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
