import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchMovies } from './movieService';

globalThis.fetch = vi.fn();

describe('movieService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch movies successfully', async () => {
        const mockMovies = [{ title: 'Test Movie' }];
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockMovies
        });

        const result = await searchMovies('test');
        
        expect(result).toEqual(mockMovies);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/movies?q=test')
        );
    });

    it('should handle API errors', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        });

        await expect(searchMovies('test'))
            .rejects
            .toThrow('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await expect(searchMovies('test'))
            .rejects
            .toThrow('Network error');
    });
});