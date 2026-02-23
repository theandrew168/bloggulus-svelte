<script lang="ts">
	import "$lib/assets/css/reset.css";
	import "$lib/assets/css/font.css";
	import "$lib/assets/css/global.css";

	import Footer from "$lib/components/layout/Footer.svelte";
	import Header from "$lib/components/layout/Header.svelte";
	import Notification from "$lib/components/Notification.svelte";

	import type { LayoutProps } from "./$types";

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>Bloggulus - A website for avid blog readers</title>
	<meta name="description" content="Bloggulus - A website for avid blog readers" />
</svelte:head>

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
