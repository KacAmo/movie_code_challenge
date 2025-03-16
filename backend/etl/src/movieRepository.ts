import { db, pgp } from "./db";


export interface MovieData {
    imdb_id: string;
    title: string;
    plot: string | null;
    poster: string | null;
    director: string | null;
}

// --- SQL Query Constants ---
const CREATE_TRIGRAMS_EXTENSION_QUERY = 'CREATE EXTENSION IF NOT EXISTS pg_trgm;';

const CREATE_TABLE_QUERY = `
    CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        imdb_id VARCHAR(20) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        plot TEXT,
        poster VARCHAR(255),
        director VARCHAR(255)
    );
`;

const CREATE_TITLE_INDEX_QUERY = `
    CREATE INDEX IF NOT EXISTS trgm_idx_title ON movies
    USING GIN (title gin_trgm_ops);
`;

const CREATE_PLOT_INDEX_QUERY = `
    CREATE INDEX IF NOT EXISTS trgm_idx_plot ON movies
    USING GIN (plot gin_trgm_ops);
`;

const CREATE_DIRECTOR_INDEX_QUERY = `
    CREATE INDEX IF NOT EXISTS trgm_idx_director ON movies
    USING GIN (director gin_trgm_ops);
`;
const BATCH_INSERT_QUERY = (values: MovieData[]) => {
	const columnSet = new pgp.helpers.ColumnSet(
		['imdb_id', 'title', 'plot', 'poster', 'director'],
		{ table: 'movies' }
	);
	return pgp.helpers.insert(values, columnSet) +
	` ON CONFLICT (imdb_id) DO UPDATE SET
	title = EXCLUDED.title,
	plot = EXCLUDED.plot,
	poster = EXCLUDED.poster,
	director = EXCLUDED.director`;
};

// --- MovieRepository Class ---
export class MovieRepository {
    public async createTable() {
        try {
            await db.none(CREATE_TRIGRAMS_EXTENSION_QUERY);
            await db.none(CREATE_TABLE_QUERY);
            await db.none(CREATE_TITLE_INDEX_QUERY);
            await db.none(CREATE_PLOT_INDEX_QUERY);
            await db.none(CREATE_DIRECTOR_INDEX_QUERY);
            console.log('Movies table and indexes created or already exist.');
        } catch (error) {
            console.error('Error creating table/indexes:', error);
            throw error;
        }
    }
    public async batchInsertMovies(movies: MovieData[]) {
        if (movies.length === 0) {
            return;
        }
		try {
			const query = BATCH_INSERT_QUERY(movies);

			await db.none(query);
			console.log(`Successfully batch inserted/updated ${movies.length} movies.`);
		} catch (error) {
			console.error('Error during batch insert:', error);
			console.error('Query:', error); // Log the generated query
			throw error; // Re-throw for handling in the calling function
		}
    }
}