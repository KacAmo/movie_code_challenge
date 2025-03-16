import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess'; // Import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
		svelte({
			preprocess: sveltePreprocess(),
		}),
	],
  server: {
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: 'dist',
  },
  base: '/',
});