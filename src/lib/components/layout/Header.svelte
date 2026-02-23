<script lang="ts">
	import Link from "$lib/components/Link.svelte";
	import type { Account } from "$lib/types";

	type Props = {
		account?: Account;
	};

	let { account }: Props = $props();
</script>

<header>
	<nav>
		<ul>
			<li class="first"><Link kind="link" href="/">Bloggulus</Link></li>
			{#if account}
				<li><Link kind="link" href="/blogs">Blogs</Link></li>
				<li>
					<form method="POST" action="/signout">
						<Link kind="button" type="submit">Sign out</Link>
					</form>
				</li>
			{:else}
				<li><Link kind="link" href="/signin">Sign in</Link></li>
			{/if}
		</ul>
	</nav>
</header>

<style>
	header {
		background-color: var(--color-white);
		box-shadow: var(--shadow-md);
	}

	ul {
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 1em;
		display: flex;
		align-items: center;
		gap: 1em;
	}

	.first {
		margin-right: auto;
		font-size: 1.5rem;
	}
</style>
