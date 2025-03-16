import { Movie } from "./model";
import { MovieRepository } from "./movieRepository";

export class MovieService {
    constructor(readonly movieRepository: MovieRepository = new MovieRepository()) {
    }
    async searchMovies(query?: string): Promise<Movie[]> {
        return this.movieRepository.searchMovies(query);
    }
}