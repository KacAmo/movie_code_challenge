import App from './App.svelte';

const app = new App({
  target: document.body, // Mount directly to the body
});

export default app; // Typically not needed, but good practice