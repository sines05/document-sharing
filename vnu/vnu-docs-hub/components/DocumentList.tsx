import React from 'react';
import type { Document, University } from '../types';
import { DocumentCard } from './DocumentCard';

interface DocumentListProps {
  documents: Document[];
  universities: University[];
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, universities }) => {
  const universityMap = new Map(universities.map(uni => [uni.id, uni]));

  if (documents.length === 0) {
    return (
        <div className="flex items-center justify-center h-full min-h-[50vh] border-2 border-dashed border-gray-400">
            <p className="text-gray-600 text-lg">No documents found. Try a different filter or search term.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((doc) => {
        const university = universityMap.get(doc.universityId);
        return (
            <DocumentCard 
                key={doc.id} 
                document={doc} 
                university={university}
            />
        );
      })}
    </div>
  );
};