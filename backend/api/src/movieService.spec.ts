import { Movie } from './model';
import { MovieRepository } from './movieRepository';
import { MovieService } from './movieService';

// Mock the repository
jest.mock('./movieRepository');

describe('MovieService', () => {
    const mockMovies: Movie[] = [
        {
            id: 1,
            title: "The Matrix",
            director: "Lana Wachowski",
            tmdb_id: 0,
            overview: '',
            poster_path: null,
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('searchMovies', () => {
        it('should return movies when search is successful', async () => {
            // Arrange
            (MovieRepository.prototype.searchMovies as jest.Mock).mockResolvedValue(mockMovies);
            
            // Act
            const result = await new MovieService().searchMovies('matrix');

            // Assert
            expect(MovieRepository.prototype.searchMovies).toHaveBeenCalledWith('matrix');
            expect(result).toEqual(mockMovies);
        });

        it('should handle undefined query parameter', async () => {
            // Arrange
            (MovieRepository.prototype.searchMovies as jest.Mock).mockResolvedValue(mockMovies);
            
            // Act
            const result = await new MovieService().searchMovies();

            // Assert
            expect(MovieRepository.prototype.searchMovies).toHaveBeenCalledWith(undefined);
            expect(result).toEqual(mockMovies);
        });

        it('should handle empty result set', async () => {
            // Arrange
            (MovieRepository.prototype.searchMovies as jest.Mock).mockResolvedValue([]);
            
            // Act
            const result = await new MovieService().searchMovies('nonexistent');

            // Assert
            expect(MovieRepository.prototype.searchMovies).toHaveBeenCalledWith('nonexistent');
            expect(result).toEqual([]);
        });

        it('should propagate repository errors', async () => {
            // Arrange
            const error = new Error('Database error');
            (MovieRepository.prototype.searchMovies as jest.Mock).mockRejectedValue(error);

            // Act & Assert
            await expect(new MovieService().searchMovies('test'))
                .rejects
                .toThrow('Database error');
        });
    });
});