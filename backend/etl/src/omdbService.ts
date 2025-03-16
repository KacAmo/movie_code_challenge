import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OMDB_BASE_URL = 'http://www.omdbapi.com/';

export interface OMDBMovie {
    Title: string;
    Year: string;
    Director: string;
    Plot: string;
    Poster: string;
    imdbID: string;
    Released: string; 
    Response: string; 
    Error?: string; 
}

interface OMDBSearchResult {
    Title: string;
    Year: string;
    imdbID: string;
    Poster: string; 
}

interface OMDBSearchResponse {
    Search?: OMDBSearchResult[];
    totalResults?: string; 
    Response: string;
    Error?: string;
}
// --- OmdbApiClient Class ---

export class OmdbService {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string = OMDB_BASE_URL) {
        if (!apiKey) {
          throw new Error("OMDB_API_KEY must be provided.");
        }
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    private async omdbRequest<T>(params: Record<string, any>): Promise<T | null> {
        const response: AxiosResponse<T> = await axios.get(this.baseUrl, {
            params: {
                ...params,
                apikey: this.apiKey
            }
        });
        return response.data;
    }

    public async searchMoviesByTitleAndYear(keyword: string, year: number): Promise<OMDBSearchResult[]> {
        return  this.omdbRequest<OMDBSearchResponse>({ s: keyword, type: 'movie', y: year,})
                    .then(data => {
                            if (!data || data.Response === 'False' || !data.Search) {
                                throw new Error(`OMDb search returned no results or an error for ${keyword} (${year}): ${data?.Error}`);
                            }
                            return data.Search;
                       });
    }

    public async getMovieDetails(imdbID: string): Promise<OMDBMovie | null> {
        return this.omdbRequest<OMDBMovie>({ i: imdbID, plot: 'full'})
                    .then(data =>{
                        if (!data || data.Response === 'False') {
                            throw new Error(`OMDb returned no details or an error for IMDb ID ${imdbID}: ${data?.Error}`);
                        }
                        return data;
                    });
    }

    public async searchMovies(year: number, keyword: string): Promise<OMDBMovie[]> {
        return this.searchMoviesByTitleAndYear(keyword, year)
            .then(searchResults => Promise.all(searchResults.map(result => this.getMovieDetails(result.imdbID))))
            .then(detailedMovies => detailedMovies.filter((movie) => !!movie));
    }
}
