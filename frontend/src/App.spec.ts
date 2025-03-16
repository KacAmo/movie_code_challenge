import { render, fireEvent } from '@testing-library/svelte';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from './App.svelte';
import { searchMovies } from './services/movieService';

// Mock the movie service
vi.mock('./services/movieService', () => ({
    searchMovies: vi.fn()
}));

describe('App Component', () => {
    const mockMovies = [
        {
            imdb_id: 'tt1234567',
            title: 'Inception',
            director: 'Christopher Nolan',
            plot: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
            poster: 'https://example.com/inception.jpg'
        },
        {
            imdb_id: 'tt0111161',
            title: 'The Shawshank Redemption',
            director: 'Frank Darabont',
            plot: 'Two imprisoned men bond over a number of years.',
            poster: 'https://example.com/shawshank.jpg'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the header and search bar', () => {
        const { getByText, getByPlaceholderText } = render(App);
        expect(getByText('Movie Search')).toBeInTheDocument();
        expect(getByPlaceholderText('Search for movies...')).toBeInTheDocument();
    });

    it('should show loading state during search', async () => {
        // Create a promise that doesn't resolve immediately
        let resolvePromise: (value: any) => void = () => {};
        const promise = new Promise(resolve => { resolvePromise = resolve; });
        vi.mocked(searchMovies).mockReturnValue(promise as any);
        
        const { getByText, getByPlaceholderText } = render(App);
        
        // Trigger the search through input change
        const searchInput = getByPlaceholderText('Search for movies...');
        await fireEvent.input(searchInput, { target: { value: 'inception' } });
        await new Promise(r => setTimeout(r, 300));
        
        // Check loading state
        expect(getByText('Loading...')).toBeInTheDocument();
        
        // Resolve the promise
        resolvePromise(mockMovies);
    });

    it('should display movies when search is successful', async () => {
        vi.mocked(searchMovies).mockResolvedValue(mockMovies);
        
        const { findByText, getByPlaceholderText } = render(App);
        
        // Trigger the search through input change
        const searchInput = getByPlaceholderText('Search for movies...');
        await fireEvent.input(searchInput, { target: { value: 'inception' } });
        
        // Wait for movies to display
        expect(await findByText('Inception')).toBeInTheDocument();
        expect(await findByText('The Shawshank Redemption')).toBeInTheDocument();
    });

    it('should display error when search fails', async () => {
        vi.mocked(searchMovies).mockRejectedValue(new Error('API Error'));
        
        const { findByText, getByPlaceholderText } = render(App);
        
        // Trigger the search through input change
        const searchInput = getByPlaceholderText('Search for movies...');
        await fireEvent.input(searchInput, { target: { value: 'error' } });
        
        // Wait for error message
        expect(await findByText('Error fetching movies: API Error')).toBeInTheDocument();
    });

    it('should display no movies found message when results are empty', async () => {
        vi.mocked(searchMovies).mockResolvedValue([]);
        
        const { findByText, getByPlaceholderText } = render(App);
        
        // Trigger the search through input change
        const searchInput = getByPlaceholderText('Search for movies...');
        await fireEvent.input(searchInput, { target: { value: 'nonexistent' } });
        
        // Wait for message
        expect(await findByText('No movies found.')).toBeInTheDocument();
    });
});