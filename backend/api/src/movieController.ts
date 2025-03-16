import { Request, Response } from 'express';
import { MovieService } from './movieService';

export class MovieController {
    constructor(private readonly movieService: MovieService = new MovieService()) {
        // Default parameter allows for either DI or automatic instantiation
    }
    async searchMovies(req: Request, res: Response) {
        try {
            const query = req.query.q as string | undefined;
            const movies = await this.movieService.searchMovies(query);
            res.json(movies);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}