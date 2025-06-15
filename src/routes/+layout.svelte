<script lang="ts">
	import Footer from "$lib/components/Footer.svelte";
	import Header from "$lib/components/Header.svelte";
	import Notification from "$lib/components/Notification.svelte";

	import type { LayoutProps } from "./$types";

	let { data, children }: LayoutProps = $props();
</script>

<Header account={data.account} />
<main>
	{#if data.notification}
		<Notification message={data.notification} />
	{/if}
	{@render children()}
</main>
<Footer />

<style>
	main {
		flex-grow: 1;
		flex-basis: 0;
	}
</style>
