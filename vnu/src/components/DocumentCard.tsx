import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Document, University } from '../types';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface DocumentCardProps {
  document: Document;
  university?: University;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, university }) => {
  const navigate = useNavigate();
  const courseInfo = [university?.abbreviation, document.courseCode].filter(Boolean).join(' - ');
  const totalFiles = document.sections.reduce((sum, section) => sum + section.files.length, 0);

  const handleCardClick = () => {
    navigate(`/documents/${document.id}`);
  };

  return (
    <div 
        className="border-2 border-black bg-white flex flex-col h-full transition-all duration-200 ease-in-out hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer" 
        style={{ boxShadow: '4px 4px 0px #000' }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCardClick()}
        aria-label={`View details for ${document.title}`}
    >
      <div className="p-4 flex-grow">
        <div className="mb-2">
            <div className="text-sm font-bold text-gray-700">
                <span className="uppercase">{courseInfo}</span>
                {courseInfo && ' - '}
                <span>{document.courseName}</span>
            </div>
        </div>
        <h3 className="text-lg font-bold leading-tight">{document.title}</h3>
        <p className="text-xs text-gray-600 mt-1">
            {document.sections.length} sections • {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
        </p>
      </div>
      <div
        className="flex items-center justify-center gap-2 p-3 bg-yellow-300 border-t-2 border-black font-bold uppercase text-center hover:bg-black hover:text-yellow-300 transition-colors"
      >
        View Details
        <ChevronRightIcon />
      </div>
    </div>
  );
};