import { MovieData, MovieRepository } from './movieRepository';
import { db, pgp } from './db';

// Mock the database module
jest.mock('./db', () => ({
    db: {
        none: jest.fn(),
    },
    pgp: {
        helpers: {
            ColumnSet: jest.fn(),
            insert: jest.fn()
        }
    }
}));

describe('MovieRepository', () => {
    const mockMovies: MovieData[] = [
        {
            imdb_id: 'tt0133093',
            title: 'The Matrix',
            plot: 'A computer programmer discovers a mysterious world',
            poster: 'matrix.jpg',
            director: 'Lana Wachowski'
        },
        {
            imdb_id: 'tt0816692',
            title: 'Interstellar',
            plot: 'Space exploration story',
            poster: 'interstellar.jpg',
            director: 'Christopher Nolan'
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (pgp.helpers.ColumnSet as jest.Mock).mockReturnValue({});
        (pgp.helpers.insert as jest.Mock).mockReturnValue('INSERT QUERY');
    });

    describe('createTable', () => {
        it('should create table and indexes successfully', async () => {
            // Arrange
            (db.none as jest.Mock).mockResolvedValue(undefined);

            // Act
            await new MovieRepository().createTable();

            // Assert
            expect(db.none).toHaveBeenCalledTimes(5);
            expect(db.none).toHaveBeenCalledWith('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
            expect(db.none).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS movies'));
            expect(db.none).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS trgm_idx_title'));
            expect(db.none).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS trgm_idx_plot'));
            expect(db.none).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS trgm_idx_director'));
        });

        it('should handle database errors during table creation', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            (db.none as jest.Mock).mockRejectedValue(dbError);

            // Act & Assert
            await expect(new MovieRepository().createTable())
                .rejects
                .toThrow('Database connection failed');
        });
    });

    describe('batchInsertMovies', () => {
        it('should successfully batch insert movies', async () => {
            // Arrange
            (db.none as jest.Mock).mockResolvedValue(undefined);

            // Act
            await new MovieRepository().batchInsertMovies(mockMovies);

            // Assert
            expect(pgp.helpers.ColumnSet).toHaveBeenCalledWith(
                ['imdb_id', 'title', 'plot', 'poster', 'director'],
                { table: 'movies' }
            );
            // Add this helper function at the top of the test file
            const normalizeWhitespace = (str: string) => str.replace(/\s+/g, ' ').trim();

            // Then update the expect statement
            expect(normalizeWhitespace((db.none as jest.Mock).mock.calls[0][0])).toBe(
                normalizeWhitespace('INSERT QUERY ON CONFLICT (imdb_id) DO UPDATE SET title = EXCLUDED.title, plot = EXCLUDED.plot, poster = EXCLUDED.poster, director = EXCLUDED.director')
            );
        });

        it('should handle empty movie array', async () => {
            // Arrange
            const emptyMovies: MovieData[] = [];

            // Act
            await new MovieRepository().batchInsertMovies(emptyMovies);

            // Assert
            expect(db.none).not.toHaveBeenCalled();
            expect(pgp.helpers.ColumnSet).not.toHaveBeenCalled();
        });

        it('should handle database errors during batch insert', async () => {
            // Arrange
            const dbError = new Error('Batch insert failed');
            (db.none as jest.Mock).mockRejectedValue(dbError);

            // Act & Assert
            await expect(new MovieRepository().batchInsertMovies(mockMovies))
                .rejects
                .toThrow('Batch insert failed');
        });
    });
});