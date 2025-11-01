import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '../services/api';
import type { Document, Review, University, NewDocumentData, AdvancedSearchFilters } from '../types';

interface AppContextType {
    documents: Document[];
    universities: University[];
    loading: boolean;
    totalPages: number;
    currentPage: number;
    fetchDocuments: (page: number) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedUniversityId: string | null;
    selectUniversity: (id: string | null) => void;
    addDocument: (data: FormData) => Promise<void>;
    getDocumentById: (id: number) => Promise<Document | undefined>;
    // Reviews and comments will be handled by their respective pages
    // to avoid loading all of them at once.
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch universities once on mount
    useEffect(() => {
        const loadUniversities = async () => {
            try {
                const unis = await api.getUniversities();
                setUniversities(unis);
            } catch (error) {
                console.error("Failed to fetch universities", error);
            }
        };
        loadUniversities();
    }, []);

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    // Debounce the search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1); // Reset to page 1 when search term changes
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Fetch documents when filters, search term, or page changes
    useEffect(() => {
        const loadDocuments = async () => {
            setLoading(true);
            try {
                const { data, totalPages: newTotalPages } = await api.getDocuments(currentPage, selectedUniversityId, debouncedSearchTerm);
                setDocuments(data);
                setTotalPages(newTotalPages);
            } catch (error) {
                console.error("Failed to fetch documents", error);
                setDocuments([]);
            } finally {
                setLoading(false);
            }
        };
        loadDocuments();
    }, [selectedUniversityId, currentPage, debouncedSearchTerm]);

    const fetchDocuments = (page: number) => {
        setCurrentPage(page);
    };

    const selectUniversity = (id: string | null) => {
        if (id !== selectedUniversityId) {
            // When the university filter changes, clear existing documents and reset pagination
            // This prevents showing stale data while new data is being fetched.
            setDocuments([]);
            setTotalPages(1);
            setCurrentPage(1);
            setSelectedUniversityId(id);
        }
    };

    const addDocument = async (data: FormData) => {
        await api.addDocument(data);
        // After adding, refresh the document list by refetching the current view.
        // We reset to page 1 to ensure the new document is visible if it's approved.
        setCurrentPage(1);
    };

    const getDocumentById = async (id: number) => {
        try {
            return await api.getDocumentById(id);
        } catch (error) {
            console.error(`Failed to fetch document ${id}`, error);
            return undefined;
        }
    };

    return (
        <AppContext.Provider value={{
            documents,
            universities,
            loading,
            totalPages,
            currentPage,
            fetchDocuments,
            searchTerm,
            setSearchTerm,
            selectedUniversityId,
            selectUniversity,
            addDocument,
            getDocumentById,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};