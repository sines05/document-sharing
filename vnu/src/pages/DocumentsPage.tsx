import React from 'react';
import { DocumentList } from '../components/DocumentList';
import { Pagination } from '../components/Pagination';
import { Tabs } from '../components/Tabs';
import { useAppContext } from '../contexts/AppContext';

export const DocumentsPage: React.FC = () => {
  const {
    documents,
    universities,
    loading,
    currentPage,
    totalPages,
    fetchDocuments,
    searchTerm, // We'll handle search in a later step
    selectedUniversityId
  } = useAppContext();

  // The filtering logic is now handled by the backend.
  // The search logic will be implemented by passing a search term to the API.
  // For now, we just display the documents fetched by the context.

  const handlePageChange = (newPage: number) => {
    fetchDocuments(newPage);
  };
  
  if (loading && documents.length === 0) {
    // Show a loading indicator only on the initial load.
    // For subsequent page loads, the UI will show the old data while new data is fetched.
    return <div className="text-center p-10">Loading documents...</div>;
  }

  return (
    <>
      <Tabs />
      <DocumentList
        key={selectedUniversityId || 'all'}
        documents={documents}
        universities={universities}
      />
      <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
      />
    </>
  );
};