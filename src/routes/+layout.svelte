<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";

	import type { LayoutProps } from "./$types";

	let { data, children }: LayoutProps = $props();
</script>

<Header account={data.account} />
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
