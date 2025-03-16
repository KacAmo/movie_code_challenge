import { Request, Response } from 'express';
import { MovieController } from './movieController';
import { MovieService } from './movieService';
import { Movie } from './model';
import { MovieRepository } from './movieRepository';


describe('MovieController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockMovieService: jest.Mocked<MovieService>;
    let movieController: MovieController;
    const mockMovies: Movie[]= [{
        title: 'Test Movie',
        id: 0,
        tmdb_id: 0,
        overview: '',
        poster_path: null,
        director: ''
    }];

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Setup request and response mocks
        mockRequest = {
            query: {}
        };
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        
        // Create a fresh MovieService mock for each test
        mockMovieService = {
            searchMovies: jest.fn(),
            movieRepository: {} as jest.Mocked<MovieRepository>
        };
        
        // Create MovieController with the mock service
        movieController = new MovieController(mockMovieService);
    });

    it('should return movies when search is successful', async () => {
        // Arrange
        mockRequest.query = { q: 'test' };
        mockMovieService.searchMovies.mockResolvedValue(mockMovies);

        // Act
        await movieController.searchMovies(
            mockRequest as Request,
            mockResponse as Response
        );

        // Assert
        expect(mockMovieService.searchMovies).toHaveBeenCalledWith('test');
        expect(mockResponse.json).toHaveBeenCalledWith(mockMovies);
    });

    it('should handle empty query parameter', async () => {
        // Arrange
        mockMovieService.searchMovies.mockResolvedValue([]);

        // Act
        await movieController.searchMovies(
            mockRequest as Request,
            mockResponse as Response
        );

        // Assert
        expect(mockMovieService.searchMovies).toHaveBeenCalledWith(undefined);
        expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 when service throws error', async () => {
        // Arrange
        const error = new Error('Service error');
        mockMovieService.searchMovies.mockRejectedValue(error);

        // Act
        await movieController.searchMovies(
            mockRequest as Request,
            mockResponse as Response
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ 
            message: 'Internal Server Error' 
        });
    });
});