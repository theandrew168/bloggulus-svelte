<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import Footer from "$lib/components/Footer.svelte";
</script>

<div class="sans-serif">
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>

<style>
	div {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	main {
		flex-grow: 1;
	}
</style>
