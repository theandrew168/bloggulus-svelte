<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";

	import type { LayoutProps } from "./$types";

	let { children }: LayoutProps = $props();
</script>

<Header />
<main>
	{@render children()}
</main>
<Footer />

<style>
	main {
		flex-grow: 1;
		flex-basis: 0;
	}
</style>
