<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";

	interface Props {
		children?: import("svelte").Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="sans-serif">
	<Header />
	<main>
		{@render children?.()}
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
