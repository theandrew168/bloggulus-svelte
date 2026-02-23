<script>
	import Link from "$lib/components/Link.svelte";
</script>

<footer class="footer">
	<nav>
		<ul class="links">
			<li class="link big"><Link kind="link" href="/">Bloggulus</Link></li>
			<li class="link small"><Link kind="link" href="/docs/privacy">Privacy Policy</Link></li>
			<li class="link"><Link kind="link" href="https://shallowbrooksoftware.com">Shallow Brook Software</Link></li>
		</ul>
	</nav>
</footer>

<style>
	.footer {
		background-color: var(--color-dark);
	}

	/* On mobile devices, stack and center the footer links. */
	.links {
		color: var(--color-white);
		max-width: var(--container-width);
		margin: 0 auto;
		padding: 1em;

		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
	}

	/* On larger screens, show footer links as a single row with space between. */
	@media only screen and (min-width: 768px) {
		.links {
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		.links .link:last-child {
			margin-left: auto;
		}
	}

	.big {
		font-size: 1.25rem;
		font-weight: 500;
	}

	.small {
		font-size: 0.75rem;
	}
</style>
