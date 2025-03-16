<script lang="ts">
	export let movie: {
		title: string;
		plot: string;
		poster: string;
		director: string;
    imdb_id: string;
	};
$: posterUrl = (movie.poster && movie.poster !== 'N/A') ? movie.poster : '/placeholder.png';

</script>

<div class="movie-card">
	{#if posterUrl}
		<img src={posterUrl} alt={movie.title} class="movie-poster" />
	{:else}
		<div class="no-poster">No Poster Available</div>
	{/if}
	<div class="movie-info">
		<h3>{movie.title}</h3>
		<p>
			<strong>Director:</strong> {movie.director}
		</p>
		<p>{movie.plot}</p>
	</div>
</div>

<style>
	.movie-card {
		border: 1px solid #ddd;
		padding: 1rem;
		margin-bottom: 1rem;
		display: flex;
		gap: 1rem;
	}

	.movie-poster {
		max-width: 150px;
		height: auto;
	}

	.no-poster {
		width: 150px;
		height: 225px; /* Approximate aspect ratio of a poster */
		background-color: #eee;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #666;
	}

	.movie-info {
		flex: 1;
	}
</style>