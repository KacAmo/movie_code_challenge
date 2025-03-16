import { db } from './db';
import { Movie } from './model';
import { MovieRepository } from './movieRepository';

// Mock the db module
jest.mock('./db');

describe('MovieRepository', () => {
    // Setup mock data
    const mockMovies: Movie[] = [
        {
            id: 1,
            title: 'The Matrix',
            director: 'Lana Wachowski',
            tmdb_id: 0,
            overview: '',
            poster_path: null,
        },
        {
            id: 2,
            title: 'Inception',
            director: 'Christopher Nolan',
            tmdb_id: 0,
            overview: '',
            poster_path: null,
        }
    ];

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe('searchMovies', () => {
        it('should return all movies when no query is provided', async () => {
            // Arrange
            (db.any as jest.Mock).mockResolvedValue(mockMovies);

            // Act
            const result = await new MovieRepository().searchMovies();

            // Assert
            expect(db.any).toHaveBeenCalledWith('SELECT * FROM movies ORDER BY title');
            expect(result).toEqual(mockMovies);
        });

        it('should search movies with query when provided', async () => {
            // Arrange
            const query = 'matrix';
            const filteredMovies = [mockMovies[0]];
            (db.any as jest.Mock).mockResolvedValue(filteredMovies);

            // Act
            const result = await new MovieRepository().searchMovies(query);

            // Assert
            expect(db.any).toHaveBeenCalledWith(
                expect.stringContaining('WHERE title ILIKE $1'),
                '%matrix%'
            );
            expect(result).toEqual(filteredMovies);
        });

        it('should handle database errors', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            (db.any as jest.Mock).mockRejectedValue(dbError);

            // Act & Assert
            await expect(new MovieRepository().searchMovies('test'))
                .rejects
                .toThrow('Database connection failed');
        });

        it('should return empty array when no movies match query', async () => {
            // Arrange
            (db.any as jest.Mock).mockResolvedValue([]);

            // Act
            const result = await new MovieRepository().searchMovies('nonexistent');

            // Assert
            expect(result).toEqual([]);
        });
    });
});