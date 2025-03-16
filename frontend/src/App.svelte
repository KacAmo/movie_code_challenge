<script lang="ts">
	import SearchBar from './components/SearchBar.svelte';
	import MovieCard from './components/MovieCard.svelte';
	import { searchMovies } from './services/movieService';
  
	let movies: any[] = [];
	let searchTerm: string = '';
	let loading = false;
	let error: string | null = null;
  
	async function handleSearch(event: CustomEvent<string>) {
	  searchTerm = event.detail;
	  loading = true;
	  error = null; // Clear previous error
  
	  try {
		movies = await searchMovies(searchTerm);
		if (movies.length === 0) {
		  error = "No movies found.";
		}
	  } catch (e: any) {
		console.error('Error searching movies:', e);
		error = `Error fetching movies: ${e.message}`;
	  } finally {
		loading = false;
	  }
	}
  </script>
  
  <main>
	<h1>Movie Search</h1>
	<SearchBar on:search={handleSearch} />
  
	{#if loading}
	  <p>Loading...</p>
	{:else if error}
	  <p class="error">{error}</p>
	{:else}
	  <div class="movie-list">
		{#each movies as movie (movie.imdb_id)}
		  <MovieCard {movie} />
		{/each}
	  </div>
	{/if}
  </main>
  
  <style>
	.movie-list {
	  display: grid;
	  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	  gap: 1rem;
	}
	.error {
	  color: red;
	}
  </style>