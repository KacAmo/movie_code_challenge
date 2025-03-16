import { db } from "./db";
import { Movie } from "./model";


export class MovieRepository {
    private static readonly SEARCH_BY_KEYWORD = `SELECT * FROM movies 
                                                WHERE title ILIKE $1 
                                                OR plot ILIKE $1 
                                                OR director ILIKE $1 
                                                ORDER BY title`;


    private static readonly SELECT_ALL = `SELECT * FROM movies ORDER BY title`;

    async searchMovies(query?: string): Promise<Movie[]> {
        if(!query){
            return db.any(MovieRepository.SELECT_ALL)
                    .then(result => result as Movie[]);
        }
        return db.any(MovieRepository.SEARCH_BY_KEYWORD, query ? `%${query}%`: [])
                .then(result => result as Movie[]);
    }
}