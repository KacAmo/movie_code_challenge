import { render } from '@testing-library/svelte';
import MovieCard from './MovieCard.svelte';

describe('MovieCard Component', () => {
    const mockMovie = {
        imdb_id: '1',
        title: 'Test Movie',
        plot: 'Test Plot',
        poster: 'test.jpg',
        director: 'Test Director',
    };

    it('should render movie details', () => {
        const { getByText, getByAltText } = render(MovieCard, { props: { movie: mockMovie } });
        
        expect(getByText('Test Movie')).toBeInTheDocument();
        expect(getByText('Test Plot')).toBeInTheDocument();
        expect(getByText('Test Director')).toBeInTheDocument();
        expect(getByAltText('Test Movie')).toHaveAttribute('src', 'test.jpg');
    });
});