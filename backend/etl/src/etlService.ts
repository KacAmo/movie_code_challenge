import dotenv from 'dotenv';
import { OmdbService } from './omdbService';
import { MovieRepository } from './movieRepository';

dotenv.config();

export class ETLService {
    private intervalId: NodeJS.Timeout | undefined;
    private readonly pollingInterval = 60 * 60 * 1000; // 1 hour
    private readonly omdbService: OmdbService;
    private readonly repository: MovieRepository;

    constructor(
    ) {
        this.omdbService = new OmdbService(process.env.OMDB_API_KEY || '');
        this.repository = new MovieRepository();
    }

    async fetchData(): Promise<void> {
        try {
            await this.omdbService.searchMovies(2020, 'space')
                .then(movies => movies.map(movie => ({
                    imdb_id: movie.imdbID,
                    title: movie.Title,
                    plot: movie.Plot === 'N/A' ? null : movie.Plot,
                    poster: movie.Poster === 'N/A' ? null : movie.Poster,
                    director: movie.Director === 'N/A' ? null : movie.Director,
                })))
                .then(movieData => this.repository.batchInsertMovies(movieData));
        } catch (error) {
            console.error('Failed to fetch and store movies:', error);
        }
    }

    async start(): Promise<void> {
        if (!process.env.OMDB_API_KEY) {
            console.error('OMDB_API_KEY is not set.');
            process.exit(1);
        }

        try {
            await this.repository.createTable(); // Initialize the table
            await this.fetchData(); // Initial fetch
            this.intervalId = setInterval(() => this.fetchData(), this.pollingInterval);

            // Handle graceful shutdown
            process.on('SIGTERM', () => this.shutdown());
            process.on('SIGINT', () => this.shutdown());

        } catch (error) {
            console.error('Error in main function:', error);
            process.exit(1);
        }
    }

    private shutdown(): void {
        console.log('Shutting down ETL process...');
        clearInterval(this.intervalId);
        process.exit(0);
    }
}

