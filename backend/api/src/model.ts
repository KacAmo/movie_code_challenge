export interface Movie {
    id: number;
    tmdb_id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    director: string;
}