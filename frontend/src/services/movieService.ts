// frontend/src/services/movieService.ts
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export async function searchMovies(query?: string): Promise<any[]> {
  try {
    const url = query
      ? `${API_BASE_URL}/api/movies?q=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/api/movies`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}