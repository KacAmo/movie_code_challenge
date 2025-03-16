<script lang="ts">
	import { createEventDispatcher } from 'svelte';
  
	let searchTerm: string = '';
	const dispatch = createEventDispatcher();
	let timeoutId: NodeJS.Timeout | undefined;
  
	function handleSubmit() {
	  dispatch('search', searchTerm);
	}
	 function handleInput() {
		  // Clear the previous timeout (if any)
		  clearTimeout(timeoutId);
		  // Set a new timeout
		  timeoutId = setTimeout(() => {
				  handleSubmit();
		  }, 300); // 300ms delay
  
	  }
  </script>
  
  <form on:submit|preventDefault={handleSubmit}>
	<input
	  type="text"
	  bind:value={searchTerm}
	  placeholder="Search for movies..."
	  on:input={handleInput}
	/>
	<button type="submit">Search</button>
  </form>
  
  <style>
	/* Add some basic styling */
	input[type='text'] {
	  padding: 0.5rem;
	  border: 1px solid #ccc;
	  border-radius: 4px;
	  margin-right: 0.5rem;
	  width: 250px; /* Set a specific width */
	}
  
	button {
	  padding: 0.5rem 1rem;
	  background-color: #007bff;
	  color: white;
	  border: none;
	  border-radius: 4px;
	  cursor: pointer;
	}
  </style>