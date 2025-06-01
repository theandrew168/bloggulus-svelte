<header>
	<nav>
		<ul>
			<li class="first"><a class="home" href="/">Bloggulus</a></li>
			<li><a href="/signin">Sign in</a></li>
		</ul>
	</nav>
</header>

<style>
	header {
		background-color: var(--color-white);
		box-shadow: var(--shadow);
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
	}

	a {
		display: inline-block;
		color: var(--color-dark);
		text-decoration: none;
		font-size: 1rem;
		/* Make buttons look like links, if necessary (like for the logout form). */
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	a:hover {
		color: var(--color-medium);
	}

	.home {
		font-size: 1.5rem;
	}
</style>
