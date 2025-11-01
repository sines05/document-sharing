import { API_BASE_URL } from '../constants';
import type { University, Document, Review, Comment, NewDocumentData, NewReviewData } from '../types';

/**
 * A helper function to handle fetch requests and JSON parsing.
 * @param url The URL to fetch.
 * @param options The fetch options.
 * @returns The JSON response.
 */
const fetchJson = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Request failed with status ' + response.status }));
        throw new Error(errorBody.error || 'An unknown error occurred');
    }
    return response.json();
};

export const api = {
    /**
     * Fetches all universities.
     */
    getUniversities: (): Promise<University[]> => {
        return fetchJson(`${API_BASE_URL}/universities`);
    },

    /**
     * Fetches a paginated list of documents.
     * @param page The page number to fetch.
     * @param universityId Optional university ID to filter by.
     */
    getDocuments: (page = 1, universityId: string | null = null, searchTerm: string = ''): Promise<{ data: Document[], totalPages: number }> => {
        const params = new URLSearchParams({ page: page.toString() });
        if (universityId) params.append('universityId', universityId);
        if (searchTerm) params.append('searchTerm', searchTerm);
        return fetchJson(`${API_BASE_URL}/documents?${params.toString()}`);
    },

    /**
     * Fetches a single document by its ID.
     * @param id The ID of the document.
     */
    getDocumentById: (id: number): Promise<Document> => {
        return fetchJson(`${API_BASE_URL}/documents/${id}`);
    },

    /**
     * Fetches reviews, grouped by lecturer.
     * @param universityId Optional university ID to filter by.
     * @param searchTerm Optional search term.
     */
    getReviews: (universityId: string | null = null, searchTerm: string = ''): Promise<Review[]> => {
        const params = new URLSearchParams();
        if (universityId) params.append('universityId', universityId);
        if (searchTerm) params.append('searchTerm', searchTerm);
        return fetchJson(`${API_BASE_URL}/reviews?${params.toString()}`);
    },

    /**
     * Uploads a new document.
     * @param data The form data for the new document.
     */
    addDocument: (formData: FormData): Promise<{ message: string, documentId: number }> => {
        return fetchJson(`${API_BASE_URL}/documents`, {
            method: 'POST',
            body: formData, // The FormData object is now passed directly
        });
    },
};