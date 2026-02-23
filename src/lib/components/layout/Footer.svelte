<footer>
	<nav>
		<ul>
			<li><a class="big" href="/">Bloggulus</a></li>
			<li><a class="small" href="/docs/privacy">Privacy Policy</a></li>
			<li><a href="https://shallowbrooksoftware.com">Shallow Brook Software</a></li>
		</ul>
	</nav>
</footer>

<style>
	footer {
		background-color: var(--color-dark);
	}

	/* On mobile devices, stack and center the footer links. */
	ul {
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
		ul {
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		ul li:last-child {
			margin-left: auto;
		}
	}

	a {
		color: var(--color-white);
		text-decoration: none;
	}

	a:hover {
		color: var(--color-light);
	}

	.big {
		font-size: 1.25rem;
		font-weight: 500;
	}

	.small {
		font-size: 0.75rem;
	}
</style>
