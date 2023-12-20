<script>
	import "$lib/styles/reset.css";
	import "$lib/styles/fonts.css";
	import "$lib/styles/style.css";
</script>

<div class="sans-serif">
	<nav class="nav shadow">
		<div class="container">
			<div class="nav-items">
				<a href="/">Bloggulus</a>
				<input />
			</div>
		</div>
	</nav>
	<slot />
</div>

<style>
	.nav {
		background-color: white;
		padding: 1rem 0;
		margin-bottom: 1rem;
	}
	.nav-items {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
