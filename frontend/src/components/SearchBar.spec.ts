import { render, fireEvent } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from './SearchBar.svelte';

describe('SearchBar Component', () => {
    it('should render search input', () => {
        const { getByPlaceholderText } = render(SearchBar);
        expect(getByPlaceholderText('Search for movies...')).toBeInTheDocument();
    });

    it('should emit search event on input', async () => {
        const { component, getByRole } = render(SearchBar);
        const searchInput = getByRole('textbox');
        const mockHandler = vi.fn();
        
        component.$on('search', mockHandler);
        await fireEvent.input(searchInput, { target: { value: 'test' } });
        await new Promise(resolve => setTimeout(resolve, 300));
        expect(mockHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: 'test'
            })
        );
    });

    it('should debounce search events', async () => {
        const { component, getByRole } = render(SearchBar);
        const searchInput = getByRole('textbox');
        const mockHandler = vi.fn();
        
        component.$on('search', mockHandler);
        await fireEvent.input(searchInput, { target: { value: 't' } });
        await fireEvent.input(searchInput, { target: { value: 'te' } });
        await fireEvent.input(searchInput, { target: { value: 'test' } });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        expect(mockHandler).toHaveBeenCalledTimes(1);
        expect(mockHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: 'test'
            })
        );
    });
});