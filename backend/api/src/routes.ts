import express, { Router, Request, Response } from 'express';
import { MovieController } from './movieController';

export class Routes {
    private router: Router;
    private readonly movieController: MovieController;
    
    constructor() {
        this.router = express.Router();
        this.movieController = new MovieController();
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.get('/api/movies', this.movieController.searchMovies.bind(this.movieController));
        this.router.get('/', (req: Request, res: Response) => {
            res.send('Movie Search API is running!');
        });
    }

    public getRouter(): Router {
        return this.router;
    }
}