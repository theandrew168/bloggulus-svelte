<script>
	import "$lib/styles/reset.css";
	import "$lib/styles/fonts.css";
	import "$lib/styles/style.css";
	import NavBar from "$lib/components/NavBar.svelte";
</script>

<div class="sans-serif">
	<NavBar />
	<slot />
</div>
