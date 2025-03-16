import axios from 'axios';
import { OmdbService } from './omdbService';
import { OMDBMovie } from './omdbService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OmdbApiClient', () => {
    const API_KEY = 'test-api-key';
    const BASE_URL = 'http://www.omdbapi.com/';
    let client: OmdbService;

    const mockSearchResponse = {
        data: {
            Search: [
                {
                    Title: 'The Matrix',
                    Year: '1999',
                    imdbID: 'tt0133093',
                    Poster: 'matrix.jpg'
                }
            ],
            totalResults: '1',
            Response: 'True'
        }
    };

    const mockMovieDetails: OMDBMovie = {
        Title: 'The Matrix',
        Year: '1999',
        Director: 'Lana Wachowski',
        Plot: 'A computer programmer discovers...',
        Poster: 'matrix.jpg',
        imdbID: 'tt0133093',
        Released: '31 Mar 1999',
        Response: 'True'
    };

    beforeEach(() => {
        client = new OmdbService(API_KEY);
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should throw error when API key is not provided', () => {
            expect(() => new OmdbService('')).toThrow('OMDB_API_KEY must be provided');
        });

        it('should create instance with custom base URL', () => {
            const customUrl = 'http://custom.url';
            const customClient = new OmdbService(API_KEY, customUrl);
            expect(customClient).toBeDefined();
        });
    });

    describe('searchMoviesByTitleAndYear', () => {
        it('should return search results when found', async () => {
            mockedAxios.get.mockResolvedValueOnce(mockSearchResponse);

            const results = await client.searchMoviesByTitleAndYear('Matrix', 1999);

            expect(mockedAxios.get).toHaveBeenCalledWith(BASE_URL, {
                params: expect.objectContaining({
                    s: 'Matrix',
                    y: 1999,
                    type: 'movie',
                    apikey: API_KEY
                })
            });
            expect(results).toEqual(mockSearchResponse.data.Search);
        });

        it('should throw error when no results found', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { Response: 'False', Error: 'Movie not found!' }
            });

            await expect(client.searchMoviesByTitleAndYear('NonExistent', 2000))
                .rejects
                .toThrow('OMDb search returned no results');
        });

        it('should handle API errors', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

            await expect(client.searchMoviesByTitleAndYear('Matrix', 1999))
                .rejects
                .toThrow('API Error');
        });
    });

    describe('getMovieDetails', () => {
        it('should return movie details when found', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: mockMovieDetails });

            const result = await client.getMovieDetails('tt0133093');

            expect(mockedAxios.get).toHaveBeenCalledWith(BASE_URL, {
                params: expect.objectContaining({
                    i: 'tt0133093',
                    plot: 'full',
                    apikey: API_KEY
                })
            });
            expect(result).toEqual(mockMovieDetails);
        });

        it('should throw error when movie not found', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { Response: 'False', Error: 'Movie not found!' }
            });

            await expect(client.getMovieDetails('invalid-id'))
                .rejects
                .toThrow('OMDb returned no details');
        });
    });

    describe('searchMovies', () => {
        it('should return detailed movies when found', async () => {
            mockedAxios.get
                .mockResolvedValueOnce(mockSearchResponse)
                .mockResolvedValueOnce({ data: mockMovieDetails });

            const results = await client.searchMovies(1999, 'Matrix');

            expect(results).toHaveLength(1);
            expect(results[0]).toEqual(mockMovieDetails);
        });

        it('should handle errors getting specific film information', async () => {
            mockedAxios.get
                .mockResolvedValueOnce(mockSearchResponse)
                .mockRejectedValueOnce(new Error('API Error'));

                await expect(client.searchMovies(1999, 'Matrix'))
                .rejects
                .toThrow('API Error');
        });

        it('should handle search errors', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Search failed'));

            await expect(client.searchMovies(1999, 'Matrix'))
                .rejects
                .toThrow('Search failed');
        });
    });
});