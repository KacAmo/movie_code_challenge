import { ETLService } from './etlService';
import { MovieRepository } from './movieRepository';
import { OmdbService } from './omdbService';

// Mock dependencies
jest.mock('./omdbService');
jest.mock('./movieRepository');
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

describe('ETL Process', () => {
    const mockMovies = [
        {
            imdbID: 'tt1234567',
            Title: 'Space Movie',
            Plot: 'A story about space',
            Poster: 'http://example.com/poster.jpg',
            Released: '2020-01-01',
            Director: 'John Doe'
        },
        {
            imdbID: 'tt7654321',
            Title: 'Space Adventure',
            Plot: 'N/A',
            Poster: 'N/A',
            Released: 'N/A',
            Director: 'N/A'
        }
    ];

    let etlService: ETLService;

    const expectedTransformedMovies = [
        {
            imdb_id: 'tt1234567',
            title: 'Space Movie',
            plot: 'A story about space',
            poster: 'http://example.com/poster.jpg',
            director: 'John Doe'
        },
        {
            imdb_id: 'tt7654321',
            title: 'Space Adventure',
            plot: null,
            poster: null,
            director: null
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        // Reset environment for each test
        process.env.OMDB_API_KEY = 'test-api-key';
        etlService = new ETLService();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('fetchData', () => {
        it('should successfully fetch, transform and store movies', async () => {
            // Arrange
            (OmdbService.prototype.searchMovies as jest.Mock).mockResolvedValue(mockMovies);
            (MovieRepository.prototype.batchInsertMovies as jest.Mock).mockResolvedValue(undefined);

            // Act
            await etlService.fetchData();

            // Assert
            expect(OmdbService.prototype.searchMovies).toHaveBeenCalledWith(2020, 'space');
            expect(MovieRepository.prototype.batchInsertMovies).toHaveBeenCalledWith(expectedTransformedMovies);
        });

        it('should handle empty movie results', async () => {
            // Arrange
            (OmdbService.prototype.searchMovies as jest.Mock).mockResolvedValue([]);
            const consoleErrorSpy = jest.spyOn(console, 'error');

            // Act
            await etlService.fetchData();

            // Assert
            expect(MovieRepository.prototype.batchInsertMovies).toHaveBeenCalledWith([]);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });

        it('should handle API errors', async () => {
            // Arrange
            const error = new Error('API Error');
            (OmdbService.prototype.searchMovies as jest.Mock).mockRejectedValue(error);
            const consoleErrorSpy = jest.spyOn(console, 'error');

            // Act
            await etlService.fetchData();

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to fetch and store movies:',
                error
            );
        });

        it('should handle database errors', async () => {
            // Arrange
            (OmdbService.prototype.searchMovies as jest.Mock).mockResolvedValue(mockMovies);
            const error = new Error('Database Error');
            (MovieRepository.prototype.batchInsertMovies as jest.Mock).mockRejectedValue(error);
            const consoleErrorSpy = jest.spyOn(console, 'error');

            // Act
            await etlService.fetchData();

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to fetch and store movies:',
                error
            );
        });
    });

    describe('start', () => {
        it('should initialize table and start polling', async () => {
            // Arrange
            (MovieRepository.prototype.createTable as jest.Mock).mockResolvedValue(undefined);
            (OmdbService.prototype.searchMovies as jest.Mock).mockResolvedValue(mockMovies);
            const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

            // Act
            await etlService.start();
            jest.advanceTimersByTime(60 * 60 * 1000); // Advance 1 hour

            // Assert
            expect(MovieRepository.prototype.createTable).toHaveBeenCalled();
            expect(OmdbService.prototype.searchMovies).toHaveBeenCalledTimes(2); // Initial + 1 interval
            expect(exitSpy).not.toHaveBeenCalled();
        });

        it('should exit when OMDB_API_KEY is not set', async () => {
            // Arrange
            delete process.env.OMDB_API_KEY;
            const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
            const consoleErrorSpy = jest.spyOn(console, 'error');

            // Act
            await etlService.start();

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith('OMDB_API_KEY is not set.');
            expect(exitSpy).toHaveBeenCalledWith(1);
        });

        it('should handle table creation errors', async () => {
            // Arrange
            const error = new Error('Table Creation Error');
            (MovieRepository.prototype.createTable as jest.Mock).mockRejectedValue(error);
            const consoleErrorSpy = jest.spyOn(console, 'error');

            // Act
            await etlService.start();

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error in main function:', error);
        });
        it('should handle SIGTERM signal gracefully', async () => {
            // Arrange
            (MovieRepository.prototype.createTable as jest.Mock).mockResolvedValue(undefined);
            const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
            const consoleLogSpy = jest.spyOn(console, 'log');
    
            // Act
            await etlService.start();
            process.emit('SIGTERM');
    
            // Assert
            expect(consoleLogSpy).toHaveBeenCalledWith('Shutting down ETL process...');
            expect(exitSpy).toHaveBeenCalledWith(0);
        });
    
        it('should handle SIGINT signal gracefully', async () => {
            // Arrange
            (MovieRepository.prototype.createTable as jest.Mock).mockResolvedValue(undefined);
            const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
            const consoleLogSpy = jest.spyOn(console, 'log');
    
            // Act
            await etlService.start();
            process.emit('SIGINT');
    
            // Assert
            expect(consoleLogSpy).toHaveBeenCalledWith('Shutting down ETL process...');
            expect(exitSpy).toHaveBeenCalledWith(0);
        });
    
        it('should clear interval on shutdown', async () => {
            // Arrange
            (MovieRepository.prototype.createTable as jest.Mock).mockResolvedValue(undefined);
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            
            // Act
            await etlService.start();
            process.emit('SIGTERM');
    
            // Assert
            expect(clearIntervalSpy).toHaveBeenCalled();
        });
    });
});